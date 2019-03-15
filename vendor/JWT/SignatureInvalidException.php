<?php

namespace Firebase\JWT;

class SignatureInvalidException extends \UnexpectedValueException {
    public function __construct($message = "", $code = 0, \Exception $previous = null) {
        $message = L('USER_LOGIN_ILLEGAL');
        parent::__construct($message, $code, $previous);
    }

}
