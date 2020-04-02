import axios from 'axios';

export default class DataProvider {
  static getCarJson() {
    return axios.get('http://localhost:3001/getdata');
  }
}
