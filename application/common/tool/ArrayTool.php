<?php

namespace app\common\tool;

/**
 * 数组工具集
 */
class ArrayTool {

    /**
     * 用于替换数组或对象key值
     * @param array $rows 二维数组 [['apple'=>1,'banana'=>2],['apple'=>3,'banana'=>4]]
     * @param array $replaceArray 数组中要替换的字段 array("apple"=>"a","balana"=>"b")
     * @return array [['a'=>1,'b'=>2],['a'=>3,'b'=>4]]
     */
    public static function replaceArraysKey($rows, $replaceArray = array()) {
        if (!empty($replaceArray)) {
            foreach ($rows as $key => $row) {
                $rows[$key] = self::replaceArrayKey($row, $replaceArray);
            }
        }
        return $rows;
    }

    /**
     * 用户替换数组或对象中key值
     * @param array $row 一维数组 ['apple'=>1,'banana'=>2]
     * @param array $replaceArray   数组中要替换的字段 array("apple"=>"a","banana"=>"b")
     * @return array ['a'=>1,'b'=>2]
     */
    public static function replaceArrayKey($row, $replaceArray = array()) {
        if (!empty($replaceArray)) {
            foreach ($replaceArray as $subject => $replace) {
                if (isset($row[$subject])) {
                    $row[$replace] = $row[$subject];
                    unset($row[$subject]);
                }
            }
        }
        return $row;
    }

    /**
     * 截取数组或对象中指定字段
     * @param array $rows   二维数组
     * @param array $subKeyArray 数组中要截取的字段 array('id','name','...')
     * @return array
     */
    public static function cutArraysColumn($rows, $subKeyArray = array()) {
        if (!empty($subKeyArray) && $rows) {
            foreach ($rows as $key => $row) {
                $rows[$key] = self::cutArrayColumn($row, $subKeyArray);
            }
        }
        return $rows;
    }

    /**
     * 截取数组或对象中指定的字段
     * @param array $row 一维数组
     * @param array $subKeyArray 数组中要截取的字段 array('id','name','...')
     * @return mixed
     */
    public static function cutArrayColumn($row, $subKeyArray = array()) {
        if (!empty($subKeyArray)) {
            foreach ($row as $key => $val) {
                if (!in_array($key, $subKeyArray)) {
                    unset($row[$key]);
                }
            }
        }
        return $row;
    }

    /**
     * 去除数组或对象中指定字段
     * @param array $rows   二维数组
     * @param array $delKeyArray 数组中要去除的字段 array('id','name','...')
     * @return array
     */
    public static function delArraysColumn($rows, $delKeyArray = array()) {
        if (!empty($delKeyArray) && $rows) {
            foreach ($rows as $key => $row) {
                $rows[$key] = self::delArrayColumn($row, $delKeyArray);
            }
        }
        return $rows;
    }

    /**
     * 去除数组或对象中指定的字段
     * @param array $row 一维数组
     * @param array $delKeyArray 数组中要去除的字段 array('id','name','...')
     * @return mixed
     */
    public static function delArrayColumn($row, $delKeyArray = array()) {
        if (!empty($delKeyArray)) {
            foreach ($row as $key => $val) {
                if (in_array($key, $delKeyArray)) {
                    unset($row[$key]);
                }
            }
        }
        return $row;
    }

    /**
     * 对象转换成数组  （递归转换）
     * @param array|object $data
     * @return array
     */
    public static function object2array($data) {
        $newarray = array();
        if (is_object($data)) {
            foreach ($data as $key => $value) {
                if (is_object($value)) {
                    $newarray[$key] = self::object2array($value);
                } else {
                    $newarray[$key] = $value;
                }
            }
        } else {
            $newarray = $data;
        }
        return $newarray;
    }

    /**
     * 获取自定义且存在可用的数组子集，并更换新的key值
     * @param array $data ['a'=>1,'b'=>2,'c'=>3]
     * @param array $keysMap ['a'=>'apple','b'=>'banana']
     * @return array ['apple'=>1,'banana'=>2]
     */
    public static function getMapKeyArray($data, $keysMap) {
        $newData = array();
        foreach ($keysMap as $oldKey => $newKey) {
            if (array_key_exists($oldKey, $data)) {
                $newData[$newKey] = $data[$oldKey];
            }
        }
        return $newData;
    }

    /**
     * 获取自定义且存在可用的数组子集，并更换新的key值 
     * 是getMapKeyArray 二维数组版本
     * @param array $data 二维数组 [['a'=>1,'b'=>2,'c'=>3],['a'=>1,'b'=>2,'c'=>3]]
     * @param array $keysMap ['a'=>'apple','b'=>'banana']
     * @return array ['apple'=>1,'banana'=>2]
     */
    public static function getMapKeyArrays($data, $keysMap) {
        $newData = array();
        foreach ($data as $index => $oneData) {
            foreach ($keysMap as $oldKey => $newKey) {
                if (array_key_exists($oldKey, $oneData)) {
                    $newData[$index][$newKey] = $oneData[$oldKey];
                }
            }
        }
        return $newData;
    }

    /**
     * 将一维数组转换成二维数组列表
     * @param array $map ['a'=>1,'b'=>2]
     * @param array $keys ['label','id']
     * @return array [['label'=>'a','id'=>1],['label'=>'b','id'=>2]]
     */
    public static function changeMapToArrayList($map, $keys) {
        $data = array();
        foreach ($map as $index => $one) {
            $data[] = array($keys[0] => $index, $keys[1] => $one);
        }
        return $data;
    }

}