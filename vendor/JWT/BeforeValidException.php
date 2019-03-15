<?php

namespace Firebase\JWT;

class BeforeValidException extends \UnexpectedValueException {

    public function __construct($message = "", $code = 0, \Exception $previous = null) {
        $message = L('USER_LOGIN_INVALID');
        parent::__construct($message, $code, $previous);
    }

}
