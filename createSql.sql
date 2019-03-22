CREATE TABLE IF NOT EXISTS `jie_auth_group` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '' COMMENT '组名',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态',
  `rules` text NOT NULL COMMENT '规则',
  `create_time` int(10) unsigned NOT NULL DEFAULT '0',
  `update_time` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='管理后台用户组表';

CREATE TABLE IF NOT EXISTS `jie_auth_rule` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级id',
  `name` varchar(128) DEFAULT '' COMMENT '规则唯一标识',
  `title` varchar(128) NOT NULL DEFAULT '' COMMENT '规则中文名称',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：为1正常，为0禁用',
  `type` tinyint(4) NOT NULL DEFAULT '1' COMMENT '类型，暂无用',
  `condition` varchar(100) NOT NULL DEFAULT '' COMMENT '规则表达式，为空表示存在就验证，不为空表示按照条件验证',
  `create_time` int(10) unsigned NOT NULL DEFAULT '0',
  `update_time` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='管理后台权限规则';

CREATE TABLE IF NOT EXISTS `jie_auth_user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(45) NOT NULL DEFAULT '',
  `pwd` varchar(45) NOT NULL DEFAULT '',
  `salt` varchar(45) NOT NULL DEFAULT '',
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `nickname` varchar(45) NOT NULL DEFAULT '',
  `icon` varchar(1024) NOT NULL DEFAULT '',
  `create_time` int(10) unsigned NOT NULL DEFAULT '0',
  `update_time` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='管理后台用户表';

CREATE TABLE IF NOT EXISTS `jie_auth_user_group` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(45) NOT NULL DEFAULT '' COMMENT 'uid-用户名',
  `group_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'group_id',
  PRIMARY KEY (`id`),
  KEY `fk_admin_uid_idx` (`uid`),
  KEY `fk_admin_group_id_idx` (`group_id`),
  CONSTRAINT `fk_admin_group_id` FOREIGN KEY (`group_id`) REFERENCES `jie_auth_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='管理后台用户-组关系表';