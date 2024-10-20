// import moment from "moment";
import 'moment/locale/vi';
import moment from 'moment-timezone';

moment.locale('vi');
moment.tz.setDefault('Asia/Ho_Chi_Minh');

function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  }
  

function formatTimeCreate(timeCreate) {
  let p = new Date(timeCreate);
  return p.getHours() + ":" + p.getMinutes() +", "+ p.getDate() + '/' + (p.getMonth()+1) + '/' + p.getFullYear();
}

  export { formatCurrency, formatTimeCreate, moment}