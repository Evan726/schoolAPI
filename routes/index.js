var express = require('express');
var router = express.Router();

var user = require('./../controllers/user');
var userQuery = require('./../controllers/userQuery');
var school = require('./../controllers/school');
var schoolQuery = require('./../controllers/schoolQuery');
var club = require('./../controllers/club');
var running = require('./../controllers/running.js');
var runningQuery = require('./../controllers/runningQuery');
var countQuery = require('./../controllers/countQuery');
var activity = require('./../controllers/activity');
var activityQuery = require('./../controllers/activityQuery');
var login = require('./../controllers/login');
var common = require('./../controllers/common');



// var running = require('./../controllers/running');
var verify = require('./../utils/verify');



//验证token和sign
router.use(verify.APIVerify());
//router.use(verify.tokenVerify());

//router.get('/user/byId?userId=userId&token=token&sign=sign', userQuery.getUserById); //取ID用户信息

//router.post('/user/byId', user.updateUser); //修改ID用户信息 ?userId=userId&token=token&sign=sign

//公共接口
router.post('/getVerifyCode', login.getVerifyCode);
router.post('/checkVerifyCode', login.checkVerifyCode);
router.post('/uptoken', common.uptoken);
router.post('/uptokenApp', common.uptokenApp);

//学校
router.post('/school/getSchoolList', schoolQuery.getSchoolList);
router.post('/school/createSchool', school.createSchool);

//登录注册
router.post('/loginByToken', login.loginByToken);
router.post('/login', login.login);
router.post('/register', login.register);
router.post('/getUserIdbyMobile', login.getUserIdbyMobile);
router.post('/forgetPassword', login.forgetPassword);

//用户个人资料
router.post('/user/updateUser', user.updateUser);
router.post('/user/bindNumber', user.bindNumber);
router.post('/user/editPassword', user.editPassword);
router.post('/user/getUserById', userQuery.getUserById);
router.post('/user/getUserGradeByUserId', userQuery.getUserGradeByUserId);

//俱乐部
router.post('/club/getClubList', club.getClubList);
//router.post('/club/createClub', club.createClub);
router.post('/club/bindClub', club.bindClub);

//跑步
router.post('/running/creatRunning', running.creatRunning);
router.post('/running/delRunning', running.delRunning);
router.post('/running/getRunning', runningQuery.getRunning);
router.post('/running/getRunningListByDate', runningQuery.getRunningListByDate);


//统计
router.post('/count/getAchievementsCountList', countQuery.getAchievementsCountList);
router.post('/count/getRunningbyCount', countQuery.getRunningbyCount);
router.post('/count/getRunningbyWeekCount', countQuery.getRunningbyWeekCount);
router.post('/count/getRunningbyMonthCount', countQuery.getRunningbyMonthCount);
router.post('/count/getRunningbySemesterCount', countQuery.getRunningbySemesterCount);
router.post('/count/getRanking', countQuery.getRanking);
router.post('/count/getRuleBySchoolId', countQuery.getRuleBySchoolId);


//活动
router.post('/activity/creatActivity', activity.creatActivity);
router.post('/activity/delActivity', activity.delActivity);
router.post('/activity/updateActivity', activity.updateActivity);
router.post('/activity/enroller', activity.enroller);
router.post('/activity/listActivitys', activityQuery.listActivitys);
router.post('/activity/getActivity', activityQuery.getActivity);
router.post('/activity/getListActivityByMemberId', activityQuery.getListActivityByMemberId);


var schoolUser = require('./../controllers/schoolAdmin/login');
var setUp = require('./../controllers/schoolAdmin/setUp');
var adminStudent = require('./../controllers/schoolAdmin/student');
var adminClub = require('./../controllers/schoolAdmin/club');
var adminActivity = require('./../controllers/schoolAdmin/activity');
//学校管理平台
router.post('/adminSchool/login', schoolUser.login);

router.post('/adminSchool/setUp/getClubList', setUp.getClubList);

router.post('/adminSchool/setUp/setUserGrade', setUp.setUserGrade);
router.post('/adminSchool/setUp/getUserGradeBySchoolId', setUp.getUserGradeBySchoolId);
router.post('/adminSchool/setUp/setRule', setUp.setRule);
router.post('/adminSchool/setUp/getRuleBySchoolId', setUp.getRuleBySchoolId);
router.post('/adminSchool/setUp/addAdmin', setUp.addAdmin);
router.post('/adminSchool/setUp/adminList', setUp.adminList);
router.post('/adminSchool/setUp/getAdmin', setUp.getAdmin);
router.post('/adminSchool/setUp/editAdmin', setUp.editAdmin);
router.post('/adminSchool/setUp/delAdmin', setUp.delAdmin);
router.post('/adminSchool/setUp/editPassword', setUp.editPassword);
router.post('/adminSchool/setUp/resetPassword', setUp.resetPassword);

//学生管理
router.post('/adminSchool/student/studentList', adminStudent.studentList);
router.post('/adminSchool/student/getMileageListByStudentId', adminStudent.getMileageListByStudentId);
router.post('/adminSchool/student/getActivityListByStudentId', adminStudent.getActivityListByStudentId);
router.post('/adminSchool/student/StudentInfo', adminStudent.StudentInfo);
router.post('/adminSchool/student/delStudent', adminStudent.delStudent);

//俱乐部管理
router.post('/adminSchool/club/getClubList', adminClub.getClubList);
router.post('/adminSchool/club/getClubInfoById', adminClub.getClubInfoById);
router.post('/adminSchool/club/addClub', adminClub.addClub);
router.post('/adminSchool/club/editClub', adminClub.editClub);
router.post('/adminSchool/club/delClub', adminClub.delClub);
router.post('/adminSchool/club/getClubMemberByClubId', adminClub.getClubMemberByClubId);
router.post('/adminSchool/club/delClubMemberById', adminClub.delClubMemberById);
router.post('/adminSchool/club/getClubActivityByClubId', adminClub.getClubActivityByClubId);

//活动管理
router.post('/adminSchool/activity/getActivityList', adminActivity.getActivityList);
router.post('/adminSchool/activity/addActivity', adminActivity.addActivity);
router.post('/adminSchool/activity/delActivity', adminActivity.delActivity);
router.post('/adminSchool/activity/activityDetails', adminActivity.activityDetails);
router.post('/adminSchool/activity/activityMemberByActivityId', adminActivity.activityMemberByActivityId);


/**************************************************************************/
/*************************陪跑管理后台的路由 ******************************/
var schoolManage = require('./../controllers/manageBackend/schoolManage');

// 学校查询
router.post('/manageSchool/school/getSchoolList', schoolManage.getSchoolList);
router.post('/manageSchool/school/addSchoolItem', schoolManage.addSchoolItem);
router.post('/manageSchool/school/getSchoolItem', schoolManage.getSchoolItem);
router.post('/manageSchool/school/updateSchoolItem', schoolManage.updateSchoolItem);

var clubManage = require('./../controllers/manageBackend/clubManage');
router.post('/manageSchool/school/getClubList', clubManage.getClubList);

var activityManage = require('./../controllers/manageBackend/activityManage');
router.post('/manageSchool/school/getActivityList', activityManage.getActivityList);

var playerManage = require('./../controllers/manageBackend/playerManage');
router.post('/manageSchool/school/getPlayerList', playerManage.getPlayerList);
router.post('/manageSchool/school/updatePlayerAccountStatus', playerManage.updatePlayerAccountStatus);

var clientManage = require('./../controllers/manageBackend/clientManage');
router.post('/manageSchool/school/getSchoolNames', clientManage.getSchoolNames);
router.post('/manageSchool/school/addClientItem', clientManage.addClientItem);
router.post('/manageSchool/school/getClientList', clientManage.getClientList);
router.post('/manageSchool/school/resetClientPasword', clientManage.resetClientPasword);
router.post('/manageSchool/school/updateClientStatus', clientManage.updateClientStatus);

var levelManage = require('./../controllers/manageBackend/levelManage');
router.post('/manageSchool/school/getDefaultLevelList', levelManage.getDefaultLevelList);
router.post('/manageSchool/school/updateDefaultLevelItem', levelManage.updateDefaultLevelItem);

var activityTypeManage = require('./../controllers/manageBackend/activityTypesManage');
router.post('/manageSchool/school/addActivitytypesItem', activityTypeManage.addActivitytypesItem);
router.post('/manageSchool/school/getActivityTypesList', activityTypeManage.getActivityTypesList);
router.post('/manageSchool/school/delActivityTypesItem', activityTypeManage.delActivityTypesItem);

var managerLogin = require('./../controllers/manageBackend/login');
router.post('/manageSchool/school/managerLogin', managerLogin.managerLogin);
module.exports = router;