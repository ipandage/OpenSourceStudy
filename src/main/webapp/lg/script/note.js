/**
 * 本文件用来说明整个前端系统的一些改动和api
 * @author fanxuean
 */

/**
 * ligerTree对象的改动，add by fanxuean in 2013.1.31
 *
 * 1.增加了childrenName属性，默认children，可根据数据结构传入实际引用的子节点数据的键名，ligerTree对象全局改动
 * 2.增加了onHover事件，可以传入树节点的onHover事件，ligerTree.js的append方法中，接受isHover(Boolean)，nodeHtml(DOM)两个属性
 */