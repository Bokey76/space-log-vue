import req from "./req.js";

export default {
  // --文章api--
  // 获取文章列表 分页
  getArticleList(data) {
    return req.getParamsIn("/article/getAllArticles", data);
  },
  searchArticle(data) {
    return req.post("/article/searchArticle", data);
  },
  // 获取文章类目列表
  getArticleTypesList() {
    return req.get("/article/getAllArticleTypes");
  },
  // 获取文章类目 分页
  getArticleTypes(data) {
    return req.getParamsIn("/article/getArticleTypes", data);
  },
  // 获取文章内容
  getArticleContent(data) {
    return req.getParamsIn("/article/getArticleContent", data);
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
  // --oss--
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
};
