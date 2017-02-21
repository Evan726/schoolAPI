var schoolModel = require('./../models/school');

module.exports = (function() {
	return fn = {
		//创建学校
		createSchool: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			if (!req.body.schoolNo ||
				!req.body.name) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			schoolModel.create({
				schoolNo: req.body.schoolNo,
				name: req.body.name
			}, function(err, doc) {
				if (!err) {
					res.send({
						code: "0000",
						message: "ok",
						result: doc
					});
				}
				return res.send({
					code: "6001",
					message: '新增失败'
				})
			})
		}

	}
})();