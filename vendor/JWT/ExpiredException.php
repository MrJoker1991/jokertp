<?php

namespace Firebase\JWT;

class ExpiredException extends \UnexpectedValueException {

    public function __construct($message = "", $code = 0, \Exception $previous = null) {
        $message = L('USER_LOGIN_TIMEOUT');
        parent::__construct($message, $code, $previous);
    }

}
