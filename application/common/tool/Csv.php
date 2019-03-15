<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\common\tool;

/**
 * Description of Csv
 *
 * @author jm
 */
class Csv
{

    /**
     * 写入文件
     * @var type 
     */
    private static $_file = '';

    /**
     * csv表格头部标题
     * @var type 
     */
    private static $_title = array();

    /**
     * 导出文件名
     * @var type 
     */
    private static $_filename = 'sample.csv';

    /**
     * config title and file
     * @param array $config ['title'=>array(),"file"=>"./1.csv"]
     */
    public static function config($config)
    {
        if (empty($config['file'] || empty($config['title']))) {
            return false;
        }
        if (!empty($config['file'])) {
            self::$_file = $config['file'];
        }
        if (!empty($config['title'])) {
            self::$_title = $config['title'];
        }
        if (!empty($config['filename'])) {
            self::$_filename = $config['filename'];
        }
    }

    /**
     * write data to csv (append mode)
     * @param array $data [[...],[...]]
     */
    public static function writeAppend($data)
    {
        self::write($data, "a");
    }

    /**
     * write data to csv
     * @param array $data [[...],[...]]
     * @param string $mode r,r+,w,w+,a,a+,x,x+
     */
    public static function write($data, $mode = 'w')
    {
        $dir = dirname(self::$_file);
        if (!file_exists($dir) || !is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        if (!is_file(self::$_file)) {
            array_unshift($data, self::$_title);
        }

        $csvHandle = fopen(self::$_file, $mode);
        foreach ($data as $line) {
            if(is_object($line)){
                $linejson = json_encode($line);
                $line = json_decode($linejson,true);
            }
            fputcsv($csvHandle, $line);
        }
        //echo "FILE:" . self::$_file . "\n";
        fclose($csvHandle);
    }

    /**
     * 导出csv文件
     * @param string $filename 文件名
     * @data string $data 文件数据
     */
    public static function exportCsv($filename, $data)
    {
        header("Content-type:text/csv");
        header("Content-Disposition:attachment;filename=" . $filename);
        header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
        header('Expires:0');
        header('Pragma:public');
        echo $data;
        exit;
    }

    public static function export($data)
    {
        $filename = self::$_filename;
        self::exportCsv($filename, $data);
    }

}