var qiniu = require('qiniu');
module.exports = (function() {
	var fn = {
		//获取上传图片的token
		/*
			{
				"schoolimg":"1.jpg"
			}
		*/
		uptoken: function(req, res) {
			//初始化ak, sk
			//qiniu.conf.ACCESS_KEY = 'O-OmfYhznXidr0nqnHw9VWD75wiAeDTXbVAxQ9sl';
			//qiniu.conf.SECRET_KEY = '44GVOirX8zk6BK0LXPkQixtAHulO3h3W9aA9Ooo_';			
			qiniu.conf.ACCESS_KEY = 'F5FLzpXsEziXvW8GYr4Viaps73wP1lTSduGbtRAe';
			qiniu.conf.SECRET_KEY = 'VI1vrYF0BzzBZx7VV8z2Y-7Tmk9wEanhiol05PWI';
			//要上传的空间
			bucket = 'school';

			var putPolicy = new qiniu.rs.PutPolicy(bucket);

			var token = putPolicy.token();
			//生成上传 Token
			//token = uptoken(bucket, key);
			return res.send({
				code: "0000",
				message: "ok",
				// schoolimg: schoolimg,
				// filePath: filePath,
				result: {
					uptoken: token
				}
			})
		},
		uptokenApp: function(req, res) {
			//初始化ak, sk
			//qiniu.conf.ACCESS_KEY = 'O-OmfYhznXidr0nqnHw9VWD75wiAeDTXbVAxQ9sl';
			//qiniu.conf.SECRET_KEY = '44GVOirX8zk6BK0LXPkQixtAHulO3h3W9aA9Ooo_';			
			qiniu.conf.ACCESS_KEY = 'O-OmfYhznXidr0nqnHw9VWD75wiAeDTXbVAxQ9sl';
			qiniu.conf.SECRET_KEY = '44GVOirX8zk6BK0LXPkQixtAHulO3h3W9aA9Ooo_';
			//要上传的空间
			bucket = 'schoolimg';

			var putPolicy = new qiniu.rs.PutPolicy2({
				scope: bucket
			});

			var token = putPolicy.token();
			//生成上传 Token
			//token = uptoken(bucket, key);
			return res.send({
				code: "0000",
				message: "ok",
				// schoolimg: schoolimg,
				// filePath: filePath,
				result: {
					uptoken: token
				}
			})
		}

	};
	return fn;
})();