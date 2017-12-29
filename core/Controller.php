<?php

namespace travesoft\pm;

/**
 * Контроллер для обработки запросов с сайта партнера для поиска тур. услуг
 *
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */
class Controller {
    
    protected $_api = null;

    public function __construct() {
        
        $this->_api = new API();
    }
    
    /**
     * Выполнение обработки запроса
     */
    public function executeRequestProcessing () {
        
        $method = $_REQUEST['method'];
        
        $callback = (string)$_REQUEST['callback'];
        
        $params = $_REQUEST['tpm_params'];
        
        switch ($method) {
            
            case "GetFormsRenderData":
                
                $data = $this->_api->getFormRenderData($params);

                $error = "";
                if (empty($data)) {
                    $error = "Nothing found on your request";
                }
                $this->_sendResponse($data, $error, $callback);
                
                break;
            
            case "GetSearchResultRenderData":
                
                $data = $this->_api->getSearchResultRenderData($params);

                $error = "";
                if (empty($data)) {
                    $error = "Nothing found on your request";
                }
                $this->_sendResponse($data, $error, $callback);
                
                break;
                
           case "GetOffersRenderData":
                
                $data = $this->_api->getOffersRenderData($params);

                $error = "";
                if (empty($data)) {
                    $error = "Nothing found on your request";
                }
                $this->_sendResponse($data, $error, $callback);
                
                break;
                
            case "Booking":
                
                $error = "";
                if (!$this->_api->booking($params)) {
                    $error = $this->_api->bookError;
                }
                $this->_sendResponse(array(), $error, $callback);
                
                break;
            
            default: 
                
                $this->_sendResponse(array(), "Bad request", "");
        }
    } 
   
    /**
     * Отправляем результат обработки запроса
     * @param array $data
     * @param string $error
     * @param string $callback
     */
    protected function _sendResponse (array $data, string $error = "", string $callback = "") {
        
        header('Content-Type: application/javascript; charset=utf-8');
        
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
}
