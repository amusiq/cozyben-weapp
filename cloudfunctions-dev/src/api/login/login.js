const crypto = require('crypto')
const jwt = require('jwt-simple')
const {
  wxConfig,
  tokenExp
} = require('../../utils/constants.js')

const db = uniCloud.database();
const dbCmd = db.command; 

async function login(event) {
  let data = {
    appid: wxConfig.appid,
    secret: wxConfig.appSecret,
    js_code: event.code,
    grant_type: 'authorization_code'
  }

  const res = await uniCloud.httpclient.request('https://api.weixin.qq.com/sns/jscode2session', {
    method: 'GET',
    data,
    dataType: 'json'
  })

  const success = res.status === 200 && res.data && res.data.openid
  if (!success) {
    return {
      status: -1,
      msg: '微信登录失败'
    }
  }

  const {
    openid,
    //session_key 暂不需要session_key
  } = res.data;
  


  let userInfo = {
    openid,
	isAdmin: wxConfig.adminOpenid === openid
  }

  let tokenSecret = crypto.randomBytes(16).toString('hex'),
    token = jwt.encode(userInfo, tokenSecret)

  const userInDB = await db.collection('user').where({
    openid
  }).get()

  let userUpdateResult
  if (userInDB.data && userInDB.data.length === 0) {
    userUpdateResult = await db.collection('user').add({
      ...userInfo,
      tokenSecret,
      exp: Date.now() + tokenExp
    })
  } else {
    userUpdateResult = await db.collection('user').doc(userInDB.data[0]._id).set({
      ...userInfo,
      tokenSecret,
      exp: Date.now() + tokenExp
    })
  }
  
  // 获取喜爱列表
  let shareLikes = [];
  const shareLikeCollection = db.collection('share-likes');
  const shareLikeDB = await shareLikeCollection.where({ likes: openid }).field({ 'id': true }).get();
  for(let i = 0; i < shareLikeDB.data.length; i++){
	shareLikes.push(shareLikeDB.data[i].id);
  }

  if (userUpdateResult.id || userUpdateResult.updated === 1) {
    return {
      status: 0,
	  userInfo:{
		  token,
		  openid,
		  isAdmin:wxConfig.adminOpenid === openid,
		  shareLikes
	  },
      msg: '登录成功'
    }
  }

  return {
    status: -1,
    msg: '微信登录失败'
  }
}

exports.main = login
