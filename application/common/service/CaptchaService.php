<?php

namespace app\common\service;

/**
 * Description of CaptchaService
 * 
 * 基于 https://github.com/Gregwar/Captcha
 * useage：
 *      生成输出
 *      $captchaService = new \app\common\service\CaptchaService("captcha_vote_".$uid);
        $captchaService->output();
 *      验证
        $captchaService = new \app\common\service\CaptchaService("captcha_vote_".$uid);
        if($captchaService->checkCode($code)){
            return true;
        }
 *
 * @author jm
 */
class CaptchaService
{

    /**
     * 唯一标识
     * @var string 可以使用用户id ticket token
     */
    private $_id = '';
    /**
     * 配置
     * @var array
     */
    private $_config = [];

    /**
     * 验证码图创建器
     * @var \Gregwar\Captcha\CaptchaBuilder 
     */
    private $_captchaBuilder = null;

    /**
     * 验证码字符创建器
     * @var \Gregwar\Captcha\PhraseBuilder 
     */
    private $_phraseBuilder = null;

    public function __construct($id,$config=[])
    {
        vendor("Captcha.CaptchaBuilder");
        vendor("Captcha.PhraseBuilder");
        $this->init($id,$config);
    }

    /**
     * 初始化
     * @param string $id
     * @param array $config
     * @return $this
     */
    private function init($id,$config = [])
    {
        if(empty($id)){
            throw new \Exception("id不能为空");
        }
        $this->_id = $id;
        if (empty($config)) {
            $config = [
                "ttl"=>60,
                "length" => 5,
//                "chars" => "0123456789abcdefghijklmnopqrstuvwxyz",
                "chars" => "0123456789",
                "width" => 200,
                "height" => 80,
                "font" => null, //filepath 不设置时则随机captcha[0~5].ttf 的filepath
                'quality' => 50, //更多设置 详见 https://github.com/Gregwar/Captcha
            ];
        }
        $config['ttl'] = ($config['ttl'] > 0) ? $config['ttl'] : 60;
        $config['length'] = ($config['length'] > 0) ? $config['length'] : 3;
        $config['chars'] = (!empty($config['chars'])) ? $config['chars'] : '0123456789';
        $config['width'] = ($config['width'] > 0) ? $config['width'] : 150;
        $config['height'] = ($config['height'] > 0) ? $config['height'] : 40;
        $config['font'] = (file_exists($config['font'])) ? $config['font'] : null;
        $config['quality'] = ($config['quality'] > 0) ? $config['quality'] : 80;
        $this->_config = $config;
        
        if ($config['length'] && $config['chars']) {
            $this->_phraseBuilder = new \Gregwar\Captcha\PhraseBuilder($config['length'], $config['chars']);
        } elseif ($config['length']) {
            $this->_phraseBuilder = new \Gregwar\Captcha\PhraseBuilder($config['length']);
        }

        $this->_captchaBuilder = new \Gregwar\Captcha\CaptchaBuilder(null, $this->_phraseBuilder);
        return $this;
    }

    /**
     * 设置验证码规则 设置字符串 长度 字体 图片宽高 输出质量 背景色 背景图片
     * 
     * @param type $key 详见init中的config的key与value范围
     * @param type $value
     * @return $this
     */
    public function setConfig($key, $value)
    {
        $this->_config[$key] = $value;
        return $this;
    }

    /**
     * 输出验证码图片
     */
    public function output()
    {
        $width = $this->_config['width'];
        $height = $this->_config['height'];
        $font = $this->_config['font'];

        $this->_captchaBuilder->build($width, $height, $font);
        $this->setPhraseToCache();
        
        header("Content-type:image/jpeg");
        $this->_captchaBuilder->output($this->_config['quality']);
        exit;
    }
    
    /**
     * 云端保存验证码字符串
     * @return boolean
     * @throws \Exception
     */
    private function setPhraseToCache(){
        $phraseCode = $this->_captchaBuilder->getPhrase();
        if($phraseCode){
            $redis = \app\common\tool\RedisTool::getInstance();
            $ttl = $this->_config['ttl'];
            if(empty($this->_id)){
                throw new \Exception("id不能为空");
            }
            $key = \app\common\tool\RedisKey::YYZS_STRING_CAPTCHA_.$this->_id;
            $redis->setex($key, $ttl, $phraseCode);
            return true;
        }
        return false;
    }
    
    /**
     * 检查提交的验证码
     * @param type $inputCode
     * @return boolean
     */
    public function checkCode($inputCode){
        if($inputCode){
            $redis = \app\common\tool\RedisTool::getInstance();
            if(!empty($this->_id)){
                $key = \app\common\tool\RedisKey::YYZS_STRING_CAPTCHA_.$this->_id;
                $cacheCode = $redis->get($key);
                if($inputCode == $cacheCode && !empty($inputCode)){
                    $redis->del($key);
                    return true;
                }
            }
        }
        return false;
    }
}
