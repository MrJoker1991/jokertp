<?php

namespace app\common\tool;

/**
 * Description of Mail
 *
 * @author joker
 */
class Mail
{

    /**
     * 发送邮件
     * @param array $data
     * host:smpt服务器
     * username：邮箱登录用户名
     * password：登录密码，注意有些是独立密码
     * from：发件人邮箱地址
     * from_nick：发件人昵称
     * recipients：收件人邮箱地址  注意是：数组[]
     * reply：回复时的邮箱地址
     * reply_nick：回复时邮箱昵称
     * ccs：抄送邮箱 数组
     * bccs：密送邮箱 数组
     * subject：邮件主题
     * body：邮件内容
     * attachments：附件 数组 注意结构：[["file"=>"/tmp/1.txt","name"=>"我的日记"],[]]
     * @return boolean
      //https://github.com/PHPMailer/PHPMailer
     */
    public static function send($data)
    {
        $host = !empty($data['host']) ? $data['host'] : "smtp.qq.com";
        $username = !empty($data['username']) ? $data['username'] : "xxx@qq.com";
        $password = !empty($data['password']) ? $data['password'] : "xxx";

        $from = !empty($data['from']) ? $data['from'] : $username;
        $fromNick = !empty($data['from_nick']) ? $data['from_nick'] : "Joker";
        $recipients = !empty($data['recipients']) ? $data['recipients'] : [];
        $reply = !empty($data['reply']) ? $data['reply'] : $from;
        $replyNick = !empty($data['reply_nick']) ? $data['reply_nick'] : $fromNick;

        $ccs = !empty($data['ccs']) ? $data['ccs'] : [];
        $bccs = !empty($data['bccs']) ? $data['bccs'] : [];

        $subject = !empty($data['subject']) ? $data['subject'] : "";
        $body = !empty($data['body']) ? $data['body'] : "";
        $attachments = !empty($data['attachments']) ? $data['attachments'] : [];   // [["file"=>"/tmp/1.txt","name"=>"我的日记"],[]]


        vendor("phpmailer.PHPMailerAutoload");
        $mail = new \PHPMailer(true);                              // Passing `true` enables exceptions
        try {
            //Server settings
//            $mail->SMTPDebug = 2;                                 // Enable verbose debug output
            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = $host;                                // Specify main and backup SMTP servers
            $mail->SMTPAuth = true;                               // Enable SMTP authentication
            $mail->Username = $username;                        // SMTP username
            $mail->Password = $password;                        // SMTP password
            $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
            $mail->Port = 465;                                    // TCP port to connect to
            //Recipients
            $mail->setFrom($from, $fromNick); //发送邮箱地址
            foreach ($recipients as $one) {
                $mail->addAddress($one);     // 收件人 Add a recipient
            }
            $mail->addReplyTo($reply, $replyNick); //回复时，邮箱地址
            if (!empty($ccs)) {
                foreach ($ccs as $oneCc) {
                    $mail->addCC($oneCc);   //抄送
                }
            }
            if (!empty($bccs)) {
                foreach ($bccs as $oneBcc) {
                    $mail->addBCC($oneBcc);  //密送
                }
            }
            //Attachments
            if (!empty($attachments)) {
                foreach ($attachments as $oneAttachment) {
                    $name = !empty($oneAttachment['name']) ? $oneAttachment['name'] : basename($oneAttachment['file']);
                    $mail->addAttachment($oneAttachment['file'], $name);    // Optional name
                }
            }
            //Content
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = $subject;
            $mail->Body = $body;
//            $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';
            $mail->CharSet = 'UTF-8'; //邮件编码
            $mail->Encoding = 'base64'; //邮件转码方式

            $res = $mail->send();
            if ($res) {
                return true;
            } else {
                s_exception($mail->ErrorInfo);
            }
        } catch (\Exception $e) {
            s_exception($mail->ErrorInfo);
        }
    }

}