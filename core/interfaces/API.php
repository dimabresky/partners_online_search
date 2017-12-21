<?php

namespace travesoft\pm\interfaces;

/**
 * Интерфейс реализации API
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */
interface API {
    
    public function getFormRenderData (array $parameters) : array;
    
    public function getSearchResultRenderData (array $parameters) : array; 
}
