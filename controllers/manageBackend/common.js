var util = require('../../utils/util.js');
var common = (function() {
	var fn = {
		//返回6003错误
		error: function(res, code, msg) {
			return res.send({
				code: code,
				message: msg || "查询错误"
			});
		},
		errorPrint:function(res, code, err, path, msg){
			console.error(path + " error, error is " + err);
			return fn.error(res, code, msg);
		},
		sendData:function(res, code, data, msg){
			return res.send({
				code: code,
				message: msg,
				result: data
			});
		},

		managerVerify: function(req, res, callback) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				fn.error("6001", '缺少token或userId参数')
			};
			var manager = {};
			callback(manager);
			// schoolUserModel.findOne({
			// 	_id: userId
			// }, function(err, user) {
			// 	if (!err) {
			// 		callback(user)
			// 	} else {
			// 		fn.error("6003", "无此用户")
			// 	}
			// })
		}
	};
	return fn;
})();

module.exports = common;