import req from "./req.js";

export default {
  // --全局api--
  getGlobalConfig: () => {
    return req.get("/configuration/reception/getConfig")
  },

  // #region 文章--
  // 获取文章列表 分页
  getArticleList(data) {
    return req.getParamsIn("/article/getAllArticles", data);
  },
  // 筛选搜索文章列表 分页
  searchArticle(data) {
    return req.post("/article/searchArticle", data);
  },
  // 获取文章类目列表
  getArticleTypesList() {
    return req.get("/article/reception/getAllArticleTypes");
  },
  // 获取文章类目 分页
  getArticleTypes(data) {
    return req.getParamsIn("/article/getArticleTypes", data);
  },
  // 获取文章数据看台数据
  getArticleNumData(data) {
    return req.get("/article/getArticleNumData", data);
  },
  // 获取文章 人气/点赞 数据
  getArticlePopularityAndLikeData(data) {
    return req.get("/article/getArticlePopularityAndLikeData", data);
  },
  // 获取文章 类型/数量 数据
  getArticleTypeAndNumData(data) {
    return req.get("/article/getArticleTypeNum", data);
  },
  // 获取文章 关系 数据
  getArticleRelationsData(data) {
    return req.get("/article/getArticleRelationsData", data);
  },
  // 获取所有文章id和主题
  getAllArticleIdAndTopic() {
    return req.get("/article/getAllArticleIdAndTopic");
  },
  // 获取文章内容
  getArticleContent(data) {
    return req.getParamsIn("/article/reception/getArticleContent", data);
  },
  // 修改文章信息
  updateCurrentData(data) {
    return req.post("/article/updateArticleMsg", data);
  },
  // 修改文章类目信息
  updateArticleType(data) {
    return req.post("/article/updateArticleType", data);
  },
  // 添加新文章
  addNewArticle(data) {
    return req.post("/article/addArticle", data);
  },
  // 添加文章类型
  addArticleType(data) {
    return req.post("/article/addArticleType", data);
  },
  // 更新文章内容
  updateArticleContent(data) {
    return req.post("/article/updateArticleContent", data);
  },
  // 删除文章
  deleteArticle(data) {
    return req.delete("/article/deleteArticle", data);
  },
  // 删除文章类目
  deleteArticleType(data) {
    return req.delete("/article/deleteArticleType", data);
  },
  // #endregion

  // #region oss--
  /**
   * 获取oss目录下的所有文件
   * @param {String} path 目录路径（不需要环境，/开头）
   * @param {String} delimiter 可选，若为'/'，则只返回当前目录下的文件和文件夹，没有文件夹下的文件
   * @returns {Array} 文件数组
   */
  getFilesInPath(path,delimiter) {
    return req.get("/oss/getFileInPath", { path,delimiter });
  },
  /**
   * 上传oss图片
   * @param {*} data 格式：{file: 文件二进制 , path: 上传到oss的路径（若uuidOrNot为false，需要包括文件名和文件后缀）,uuidOrNot: 是否生成uuid }
   */
  uploadImage(data) {
    return req.postFormData("/oss/uploadImage", data);
  },
  /**
   * 删除oss图片
   *  @param {*} data 格式：{path: 文件在oss中的路径包括文件名及文件后缀}
   */
  deleteImage(data) {
    return req.delete("/oss/deleteImage", data);
  },
  // #endregion

  // #region 管理员--
  // 管理员登录
  adminLogin: (data) => {
    return req.post("/admin/reception/login", data);
  },
  // 管理员请求邮箱验证码
  getLoginCode: (data) => {
    return req.post("/admin/reception/getLoginCode", data);
  },
  // #endregion

  // #region 用户--
  // 分页获取用户信息
  getUserData: (data) => {
    return req.getParamsIn("/user/getAllUser", data);
  },
  // 筛选搜索用户
  searchUser: (data) => {
    return req.post("/user/searchUser", data);
  },
  // 获取所有用户的id和用户名
  getAllUserIdAndName: () => {
    return req.get("/user/getAllUserIdAndName");
  },
  // 创建用户
  createUser: (data) => {
    return req.post("/user/createUser", data);
  },
  // 更新用户信息
  updateUserData: (data) => {
    return req.post("/user/updateUser", data);
  },
  // 删除用户
  deleteUserById: (data) => {
    return req.delete("/user/deleteUser", data);
  },
  // #endregion

  // #region 管理员--
  // 分页获取管理员信息
  getAdminData: (data) => {
    return req.getParamsIn("/admin/getAllAdmin", data);
  },
  // 筛选搜索管理员
  searchAdmin: (data) => {
    return req.post("/admin/searchAdmin", data);
  },
  // 创建管理员
  createAdmin: (data) => {
    return req.post("/admin/addAdmin", data);
  },
  // 更新管理员信息
  updateAdminData: (data) => {
    return req.post("/admin/updateAdmin", data);
  },
  // 删除管理员
  deleteAdminById: (data) => {
    return req.delete("/admin/deleteAdminById", data);
  },
  // #endregion

  // #region 评论--
  // 获取评论列表 分页
  getCommentList(pageData, data) {
    return req.getParamsIn("/comment/getAllComment", pageData, data);
  },
  // 获取评论的所有子评论
  getSubComment(data) {
    return req.get("/comment/getSubComment", data);
  },
  // 搜索评论，分页
  searchComment(data) {
    return req.post("/comment/searchComment", data);
  },
  // 搜索所有评论
  searchAllComment(data) {
    return req.post("/comment/searchAllComment", data);
  },
  // 获取所有评论实体类型
  getAllCommentEntityType() {
    return req.get("/comment/getAllCommentEntityType");
  },
  // 管理员发布评论
  adminAddComment(data) {
    return req.post("/comment/adminAddComment", data);
  },
  // 更新评论
  updateComment(data) {
    return req.post("/comment/updateComment", data);
  },
  // 删除评论
  deleteCommentById(data) {
    return req.delete("/comment/deleteComment", data);
  },
  // #endregion

  // #region 友链--
  // 获取全部友链
  getAllFriendLink() {
    return req.get("/friendLink/reception/getAllFriendLink");
  },
  // 新增友链
  addFriendLink(data) {
    return req.post("/friendLink/reception/addFriendLink", data);
  },
  // 更新友链
  updateFriendLink(data) {
    return req.post("/friendLink/updateFriendLink", data);
  },
  // 删除友链
  deleteFriendLink(data) {
    return req.delete("/friendLink/deleteFriendLink", data);
  },
  // #endregion

  // #region 配置
  // 获取全部配置
  getAllConfig() {
    return req.get("/configuration/getAllConfiguration");
  },
  // 新增配置
  addConfig(data) {
    return req.post("/configuration/addConfiguration", data);
  },
  // 更新配置
  updateConfig(data) {
    return req.post("/configuration/updateConfiguration", data);
  },
  // 删除配置
  deleteConfig(data) {
    return req.delete("/configuration/deleteConfiguration", data);
  },
  // #endregion
};
