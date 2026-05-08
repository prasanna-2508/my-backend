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
  }

  async find(query = {}) {
    let data = readData(this.collection);
    Object.keys(query).forEach(key => {
      if (typeof query[key] !== 'object') {
        data = data.filter(item => item[key] === query[key]);
      }
    });
    return data;
  }

  async findOne(query) {
    const data = await this.find(query);
    const item = data[0] || null;
    if (item && this.collection === 'users') {
      item.comparePassword = async (pass) => await bcrypt.compare(pass, item.password);
      item.select = () => item; // Mock mongoose select
    }
    return item;
  }

  async findById(id) {
    const data = readData(this.collection);
    const item = data.find(item => item._id === id || item.id === id) || null;
    if (item && this.collection === 'users') {
      item.comparePassword = async (pass) => await bcrypt.compare(pass, item.password);
    }
    return item;
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

  // Support for .populate() mock
  populate(field) { return this; }
  sort(field) { return this; }
}

module.exports = {
  User: new MockModel('users'),
  BusStop: new MockModel('stops'),
  Route: new MockModel('routes'),
  Gps: new MockModel('gps')
};
