var schoolModel = require('./../models/school');
module.exports = (function() {
	return fn = {
		//查询学校列表
		getSchoolList: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};

			schoolModel.find({}, {
				schoolNo: 1,
				name: 1
			}, function(err, doc) {
				if (!err) {
					return res.send({
						code: "0000",
						message: "ok",
						result: doc
					});
				}
				return res.send({
					code: "6003",
					message: '查询失败'
				})
			})
		}

	}
})();