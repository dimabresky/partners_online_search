<?php

namespace travesoft\online;

/**
 * Контроллер для обработки запросов с сайта партнера для поиска тур. услуг
 *
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */
class Controller {
    
    public function __construct() {
        
        $this->_initApi();
    }
    
    /**
     * Выполнение обработки запроса
     */
    public function executeRequestProcessing () {
        
        $method = $_REQUEST['method'];
        
        $callback = (string)$_REQUEST['callback'];
        
        $params = $_REQUEST['params'];

        if (
                method_exists($this, $method) &&
                is_array($params) && !empty($params)
        ) {
            
            $data = $this->$method($params);
            
            $error = "";
            if (empty($data)) {
                $error = "Nothing found on your request";
            }
            $this->_sendResponse($data, $error, $callback);
            
        }
        
        $this->_sendResponse(array(), "Bad request", "");
        
    }
    
    
    
    /**
     * Отправляем результат обработки запроса
     * @param array $data
     * @param string $error
     * @param string $callback
     */
    protected function _sendResponse (array $data, string $error = "", string $callback = "") {
        
        header('Content-Type', 'application/javascript; charset=utf-8');
        
        $response = array(
            'data' => $data,
            'errorMessage' => $error,
            'isError' => strlen($error) > 0
        );
        
        if (strlen($callback) > 0) {
            echo $callback . "(" .\json_encode($response). ")";
        } else {
            echo "var TravelsoftRequestResult=" . \json_encode($response);
        }
        
        die;
        
    }
    
    /**
     * Инициализация api для работы
     */
    protected function _initApi () {
      
        /**
         * Подключение ядра битрикс
         */
        require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");

        /**
         * Подключение модуля бронирования сайта
         */
        \Bitrix\Main\Loader::includeModule("travelsoft.booking.dev.tools");
    }
}
