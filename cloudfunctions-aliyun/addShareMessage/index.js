'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var jwt_1 = createCommonjsModule(function (module) {
/*
 * jwt-simple
 *
 * JSON Web Token encode and decode module for node.js
 *
 * Copyright(c) 2011 Kazuhito Hokamura
 * MIT Licensed
 */

/**
 * module dependencies
 */



/**
 * support algorithm mapping
 */
var algorithmMap = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
  RS256: 'RSA-SHA256'
};

/**
 * Map algorithm to hmac or sign type, to determine which crypto function to use
 */
var typeMap = {
  HS256: 'hmac',
  HS384: 'hmac',
  HS512: 'hmac',
  RS256: 'sign'
};


/**
 * expose object
 */
var jwt = module.exports;


/**
 * version
 */
jwt.version = '0.5.6';

/**
 * Decode jwt
 *
 * @param {Object} token
 * @param {String} key
 * @param {Boolean} [noVerify]
 * @param {String} [algorithm]
 * @return {Object} payload
 * @api public
 */
jwt.decode = function jwt_decode(token, key, noVerify, algorithm) {
  // check token
  if (!token) {
    throw new Error('No token supplied');
  }
  // check segments
  var segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Not enough or too many segments');
  }

  // All segment should be base64
  var headerSeg = segments[0];
  var payloadSeg = segments[1];
  var signatureSeg = segments[2];

  // base64 decode and parse JSON
  var header = JSON.parse(base64urlDecode(headerSeg));
  var payload = JSON.parse(base64urlDecode(payloadSeg));

  if (!noVerify) {
    if (!algorithm && /BEGIN( RSA)? PUBLIC KEY/.test(key.toString())) {
      algorithm = 'RS256';
    }

    var signingMethod = algorithmMap[algorithm || header.alg];
    var signingType = typeMap[algorithm || header.alg];
    if (!signingMethod || !signingType) {
      throw new Error('Algorithm not supported');
    }

    // verify signature. `sign` will return base64 string.
    var signingInput = [headerSeg, payloadSeg].join('.');
    if (!verify(signingInput, key, signingMethod, signingType, signatureSeg)) {
      throw new Error('Signature verification failed');
    }

    // Support for nbf and exp claims.
    // According to the RFC, they should be in seconds.
    if (payload.nbf && Date.now() < payload.nbf*1000) {
      throw new Error('Token not yet active');
    }

    if (payload.exp && Date.now() > payload.exp*1000) {
      throw new Error('Token expired');
    }
  }

  return payload;
};


/**
 * Encode jwt
 *
 * @param {Object} payload
 * @param {String} key
 * @param {String} algorithm
 * @param {Object} options
 * @return {String} token
 * @api public
 */
jwt.encode = function jwt_encode(payload, key, algorithm, options) {
  // Check key
  if (!key) {
    throw new Error('Require key');
  }

  // Check algorithm, default is HS256
  if (!algorithm) {
    algorithm = 'HS256';
  }

  var signingMethod = algorithmMap[algorithm];
  var signingType = typeMap[algorithm];
  if (!signingMethod || !signingType) {
    throw new Error('Algorithm not supported');
  }

  // header, typ is fixed value.
  var header = { typ: 'JWT', alg: algorithm };
  if (options && options.header) {
    assignProperties(header, options.header);
  }

  // create segments, all segments should be base64 string
  var segments = [];
  segments.push(base64urlEncode(JSON.stringify(header)));
  segments.push(base64urlEncode(JSON.stringify(payload)));
  segments.push(sign(segments.join('.'), key, signingMethod, signingType));

  return segments.join('.');
};

/**
 * private util functions
 */

function assignProperties(dest, source) {
  for (var attr in source) {
    if (source.hasOwnProperty(attr)) {
      dest[attr] = source[attr];
    }
  }
}

function verify(input, key, method, type, signature) {
  if(type === "hmac") {
    return (signature === sign(input, key, method, type));
  }
  else if(type == "sign") {
    return crypto.createVerify(method)
                 .update(input)
                 .verify(key, base64urlUnescape(signature), 'base64');
  }
  else {
    throw new Error('Algorithm type not recognized');
  }
}

function sign(input, key, method, type) {
  var base64str;
  if(type === "hmac") {
    base64str = crypto.createHmac(method, key).update(input).digest('base64');
  }
  else if(type == "sign") {
    base64str = crypto.createSign(method).update(input).sign(key, 'base64');
  }
  else {
    throw new Error('Algorithm type not recognized');
  }

  return base64urlEscape(base64str);
}

function base64urlDecode(str) {
  return Buffer.from(base64urlUnescape(str), 'base64').toString();
}

function base64urlUnescape(str) {
  str += new Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

function base64urlEncode(str) {
  return base64urlEscape(Buffer.from(str).toString('base64'));
}

function base64urlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
});

var jwtSimple = jwt_1;

const wxConfig = {
  appid: 'wx3acde531639847bf', //微信小程序AppId
  appSecret: 'a4296cbfd94020c21bcb3441b89129cb', //微信小程序AppSecret
  adminOpenid: 'oqxlt5Ynaqh47aGfD_ExJ6Y5Oong', // 管理员自己的openid
  mchid: '', // 商户号
  partnerKey: '' // key为商户平台设置的密钥key
};

const passSecret = ''; //用于用户数据库密码加密的密钥，使用一个比较长的随机字符串即可

//上面的字段非常重要！！！

const tokenExp = 7200000;

var constants = {
  wxConfig,
  passSecret,
  tokenExp
};

const {
  wxConfig: wxConfig$1,
} = constants;

const db = uniCloud.database();
async function validateToken(token) {
  if(!token){
	  return {
	  	  status: -2,
	  	  msg: '无token'
	  }
  }
  const userFromToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  const userInDB = await db.collection('user').where(userFromToken).get();
  if (userInDB.data.length !== 1) {
    return {
      status: -1,
      msg: '根据token查无此人'
    }
  }
  const userInfoDB = userInDB.data[0];
  let userInfoDecode;

  userInfoDecode = jwtSimple.decode(token, userInfoDB.tokenSecret);

  function checkUser(userFromToken, userInfoDB) {
    return Object.keys(userFromToken).every(function(item) {
      return userFromToken[item] === userInfoDB[item] && userFromToken[item] === userInfoDecode[item]
    })
  }


  if (userInfoDB.exp > Date.now() && checkUser(userFromToken, userInfoDB)) {
	// 获取喜爱列表
	let shareLikes = [];
	const shareLikeCollection = db.collection('share-likes');
	const shareLikeDB = await shareLikeCollection.where({ likes: userInfoDB.openid }).field({ 'id': true }).get();
	for(let i = 0; i < shareLikeDB.data.length; i++){
		shareLikes.push(shareLikeDB.data[i].id);
	}
    return {
      status: 0,
	  userInfo:{
		  token,
		  openid: userInfoDB.openid,
		  isAdmin: userInfoDB.openid === wxConfig$1.adminOpenid,
		  shareLikes
	  },
      msg: 'token验证成功'
    }
  }

  if (userInfoDB.exp < Date.now()) {
    return {
      status: -3,
      msg: 'token已失效'
    }
  }

  return {
    status: -2,
    msg: 'token无效'
  }

}

var validateToken_1 = {
  validateToken
};

const {
  validateToken: validateToken$1
} = validateToken_1;

const db$1 = uniCloud.database();
async function addShareMessage(event) {
	const checkRes = await validateToken$1(event.token);
	if(checkRes.status !== 0) return checkRes;
	if(!checkRes.userInfo.isAdmin) return {
		status: 500,
		msg:'无权限'
	};
	const collection = db$1.collection('share-message');
	const res = await collection.add(event);
	if(res.id){
		return {
			status:0,
			msg:'添加成功',
			data:res
		}
	} else {
		return {
			status:1,
			msg:'添加失败',
			data:res
		}
	}
}

var main = addShareMessage;

var addShareMessage_1 = {
	main: main
};

exports.default = addShareMessage_1;
exports.main = main;
