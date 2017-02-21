var crypto = require('crypto');
var https = require('https');

var util = {

	countTime: function(data) {
		var today = new Date(data || new Date());
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		today.setMilliseconds(0);
		//console.log("今天0点:", today);
		var oneday = 1000 * 60 * 60 * 24;

		return {
			today: today
		}
	},
	GetDateStr: function(AddDayCount, data) {
		var dd = new Date(data || new Date());
		dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
		var y = dd.getFullYear();
		var m = dd.getMonth() + 1; //获取当前月份的日期 
		var d = dd.getDate();
		return m + "-" + d;
	},

	//获取周的第一天和最后一天
	getDays: function() {
		var now = new Date;
		var day = now.getDay();
		var week = "1234560";
		var first = 0 - week.indexOf(day);
		var f = new Date;
		f.setDate(f.getDate() + first);
		// console.log("day:", day);
		// console.log("first:", first);
		// console.log("f:", f);
		var last = 6 - week.indexOf(day);
		var l = new Date;
		l.setDate(l.getDate() + last);

		f.setHours(0);
		f.setMinutes(0);
		f.setSeconds(0);
		f.setMilliseconds(0);
		l.setHours(23);
		l.setMinutes(59);
		l.setSeconds(59);
		l.setMilliseconds(999);
		var weekDays = [];
		for (var i = 0; i < 7; i++) {
			weekDays[i] = this.GetDateStr(i, f)
		}
		var dataJson = {
			firstData: f,
			lastData: l,
			days: weekDays,
		};
		//console.log("dataJson:", dataJson);
		return dataJson;
	},


	//获取当月的第一天
	getCurrentMonthFirst: function(data) {
		var date = new Date(data || new Date());
		date.setDate(1);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		var monthDays = [];
		var day = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		for (var i = 0; i < day.getDate(); i++) {
			monthDays[i] = this.GetDateStr(i, date)
		}
		return {
			data: date,
			days: monthDays
		};
	},
	//获取当月的最后一天
	getCurrentMonthLast: function(data) {
		var date = new Date(data || new Date());
		var currentMonth = date.getMonth();
		var nextMonth = ++currentMonth;
		var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
		var oneDay = 1000 * 60 * 60 * 24;
		var lastDay = new Date(nextMonthFirstDay - oneDay);
		lastDay.setHours(23);
		lastDay.setMinutes(59);
		lastDay.setSeconds(59);
		lastDay.setMilliseconds(999);
		return {
			data: lastDay
		};
	},

	timeStamp: function() {
		Date.prototype.Format = function(fmt) { //author: meizz 
			var o = {
				"M+": this.getMonth() + 1, //月份 
				"d+": this.getDate(), //日 
				"h+": this.getHours(), //小时 
				"m+": this.getMinutes(), //分 
				"s+": this.getSeconds(), //秒 
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
				"S": this.getMilliseconds() //毫秒 
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		}
		var date = new Date();
		return date.Format('yyyyMMddhhmmss');
	},


	timeInterval: function(startTime, endTime) {
		var date = endTime.getTime() - startTime.getTime(); //时间差的毫秒数
		//计算出相差天数
		var days = Math.floor(date / (24 * 3600 * 1000));
		//计算出小时数

		var leave1 = date % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
		//var hours = Math.floor(leave1 / (3600 * 1000));
		//计算相差分钟数
		var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
		var seconds = Math.floor(leave2 / 1000);
		//计算相差秒数
		//var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
		//var seconds = Math.round(leave3 / 1000);

		return seconds
	},

	md5: function(vaule) {
		var md5 = crypto.createHash('md5');
		return md5.update(vaule).digest('hex');
	},

	md5Salt: function(vaule) {
		var salt = 'ABCDEFG$'
		var md5 = crypto.createHash('md5');
		return md5.update(vaule + salt).digest('hex');
	},

	getSixRandom: function() {

		return Math.ceil(Math.random() * 1000000, 9999999);

	},

	getJsonLength: function(data) {
		var jsonLength = 0;
		for (var item in data) {
			jsonLength++;
		}
		return jsonLength;
	},

	verifyCode: function(mobile, callback) {

		var accountSID = '8a48b551510f653b0151134996f80cb8';
		var SIDToken = '5a05f7a5422f4a948326aeceb520de0c';
		var APPId = 'aaf98f89510f639f0151134c2e0e0b94';
		var TemplateId = '50308';
		var time = this.timeStamp();
		var sigParameter = this.md5(accountSID + SIDToken + time).toUpperCase();
		var url = '/2013-12-26/Accounts/' + accountSID + '/SMS/TemplateSMS?sig=' + sigParameter;
		var auth = new Buffer(accountSID + ':' + time).toString('base64');
		var sixCode = new Array(this.getSixRandom().toString());
		var data = {
			to: mobile,
			appId: APPId,
			templateId: TemplateId,
			datas: sixCode
		};

		var postData = JSON.stringify(data)


		var header = {
			Accept: 'application/json',
			'Content-Type': 'application/json;charset=utf-8',
			'Content-Length': this.getJsonLength(postData),
			Authorization: auth
		};

		var options = {
			host: 'app.cloopen.com',
			port: 8883,
			path: url,
			headers: header,
			method: 'POST'
		};
		//console.log('POST:', postData, options, header, data)

		var req = https.request(options, function(res) {

			res.on('data', function(chunk) {
				callback(chunk.toString(), sixCode);
			});


		});

		req.on('error', function(e) {
			console.log("problem with request:", e.message);
		});

		// write data to request body
		req.write(postData);
		req.end();

	},
	trim: function(string) {
		return string.replace(/(^\s*)|(\s*$)/g, "")
	}
}

module.exports = util;