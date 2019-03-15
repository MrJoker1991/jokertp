<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\common\tool;

/**
 * Description of Jwt
 *
 * @author jm
 */
class JwtTool
{
    /**
     * 所有jwt渠道的配置
     * @var array 
     */
    private $_config = [
        "common"=>[
            "jwt_id"=>"common",                     //id
            "jwt_key"=>"jokercommon",     //加密需要的密钥
            "jwt_alg"=>"HS256"                      //加密算法
        ],
        "h5"=>[
            "jwt_id"=>"h5",
            "jwt_key"=>"jokerh5",
            "jwt_alg"=>"HS256"
        ]        
    ];


    public function __construct() {
        vendor("JWT.JWT");
        vendor("JWT.BeforeValidException");
        vendor("JWT.ExpiredException");
        vendor("JWT.SignatureInvalidException");
    }

    /**
     * 提供给h5的token串
     * @param int $lifeTime token有效时长 单位秒
     * @param array $more jwt的payload信息，主要放一些不敏感的用户信息
     * @return string
     * @throws \Exception
     */
    public function getH5Token($lifeTime = 7200, $more = array()) {
        $currentTime = time();
        $token = array(
//            "iss" => "starryteam", //签发者
//            "aud" => "hdjer", //接收方
            "iat" => $currentTime, //签发时间
            "nbf" => $currentTime, //在该时间之前无效
            "exp" => $currentTime + $lifeTime, //过期时间
//            "jti" => md5($currentTime) . 'id', //jwt id
        );
        $token = array_merge($token, $more);
        try {
            return \Firebase\JWT\JWT::encode($token, $this->_config['h5']['jwt_key'], $this->_config['h5']['jwt_alg'],$this->_config['h5']['jwt_id']);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    
    /**
     * 通用token串
     * @param int $lifeTime token有效时长 单位秒
     * @param array $more jwt的payload信息，主要放一些不敏感的用户信息
     * @return string
     * @throws \Exception
     */
    public function getCommonToken($lifeTime = 7200, $more = array()) {
        $currentTime = time();
        $token = array(
//            "iss" => "starryteam", //签发者
//            "aud" => "hdjer", //接收方
            "iat" => $currentTime, //签发时间
            "nbf" => $currentTime, //在该时间之前无效
            "exp" => $currentTime + $lifeTime, //过期时间
//            "jti" => md5($currentTime) . 'id', //jwt id
        );
        $token = array_merge($token, $more);
        try {
            return \Firebase\JWT\JWT::encode($token, $this->_config['common']['jwt_key'], $this->_config['common']['jwt_alg'],$this->_config['common']['jwt_id']);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }    

    /**
     * 检查客户端token并获取payload中的信息
     * @param string $token
     * @return array|false
     * @throws \Exception
     */
    public function checkH5Token($token) {
        try {
            return \Firebase\JWT\JWT::decode($token, $this->_config['h5']['jwt_key'], array($this->_config['h5']['jwt_alg']));
        } catch (\Exception $ex) {
            return false;
//            throw new \Exception($ex->getMessage());
        }
    }
    
    /**
     * 检查通用token并获取payload中的信息
     * @param string $token
     * @return array|false
     * @throws \Exception
     */
    public function checkCommonToken($token) {
        try {
            return \Firebase\JWT\JWT::decode($token, $this->_config['common']['jwt_key'], array($this->_config['common']['jwt_alg']));
        } catch (\Exception $ex) {
            return false;
        }
    }      
}