const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

class MockModel {
  constructor(collection) {
    this.collection = collection;
    this.currentQuery = null;
  }

  // Chainable methods
  select(fields) { return this; }
  populate(fields) { return this; }
  sort(fields) { return this; }

  // This allows the class to be "awaited" like a promise
  async then(resolve, reject) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  }

  async execute() {
    if (!this.currentQuery) return null;
    
    const { type, query, payload, id } = this.currentQuery;
    this.currentQuery = null; // Reset for next call

    let data = readData(this.collection);

    if (type === 'find') {
      Object.keys(query).forEach(key => {
        if (typeof query[key] !== 'object') {
          data = data.filter(item => item[key] === query[key]);
        }
      });
      return data;
    }

    if (type === 'findOne') {
      const item = data.find(item => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
      if (item && this.collection === 'users') {
        item.comparePassword = async (pass) => await bcrypt.compare(pass, item.password);
      }
      return item;
    }

    if (type === 'findById') {
      const item = data.find(item => item._id === id || item.id === id);
      if (item && this.collection === 'users') {
        item.comparePassword = async (pass) => await bcrypt.compare(pass, item.password);
      }
      return item;
    }

    return null;
  }

  find(query = {}) {
    this.currentQuery = { type: 'find', query };
    return this;
  }

  findOne(query = {}) {
    this.currentQuery = { type: 'findOne', query };
    return this;
  }

  findById(id) {
    this.currentQuery = { type: 'findById', id };
    return this;
  }

  async create(payload) {
    const data = readData(this.collection);
    let finalPayload = { ...payload };
    
    if (this.collection === 'users' && payload.password) {
      finalPayload.password = await bcrypt.hash(payload.password, 12);
    }

    const newItem = {
      _id: Math.random().toString(36).substr(2, 9),
      ...finalPayload,
      createdAt: new Date().toISOString()
    };
    
    data.push(newItem);
    writeData(this.collection, data);
    return newItem;
  }

  async findByIdAndUpdate(id, update) {
    const data = readData(this.collection);
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...update, updatedAt: new Date().toISOString() };
    writeData(this.collection, data);
    return data[index];
  }

  async countDocuments() {
    return (readData(this.collection)).length;
  }

  async insertMany(items) {
    const data = readData(this.collection);
    const newItems = items.map(item => ({
      _id: Math.random().toString(36).substr(2, 9),
      ...item,
      createdAt: new Date().toISOString()
    }));
    writeData(this.collection, [...data, ...newItems]);
    return newItems;
  }
}

module.exports = {
  User: new MockModel('users'),
  BusStop: new MockModel('stops'),
  Route: new MockModel('routes'),
  Gps: new MockModel('gps')
};
