<?php

namespace travesoft\pm\interfaces;

/**
 * Интерфейс реализации API
 * @author dimabresky
 * @copyright (c) 2017, travelsoft
 */
interface API {
    
    /**
     * Получение данных для отображения форм поиска
     * @param array $parameters ["types" => "excursions|placements|sanatorium"]
     * @return array [
     * 
     *      "excursions||placements||sanatorium" => [
     * 
     *          "tabIsActive" => true||false,
     * 
     *          "tabTitle" => Название вкладки,
     * 
     *          "objects" => [  // Объекты поиска
     * 
     *                  [
     *                      "forSelect" => [
     * 
     *                          "id" => id объекта
     * 
     *                          "name" => название объекта,
     * 
     *                          "isSelected" => true||false
     * 
     *                      ],
     * 
     *                      "title" => заголовок поля для поиска
     *                  ],
     *                  ...
     *          ],
     * 
     *          "dates" => [
     * 
     *              "title" => заголовок поля для ввода дат
     *              
     *              "separator" => разделитель дат периода проживания
     * 
     *              "format" => формат для отображения дат
     * 
     *              "durationTitle" => заголовок для "продолжительность",
     * 
     *              "inputValue" => значение для поля ввода,
     *              
     *           ],
     * 
     *           "adults" => [
     * 
     *              "title" => заголовок поля
     * 
     *           ],
     *          
     *          "children" => [
     *  
     *              "title" => заголовок поля,
     *          
     *              "ageSelectTitle" => заголовок поля с выбором возраста
     * 
     *              "ageTitle" => заголовок блока с выбором возрастов,   
     *  
     *          ],
     * 
     *          "button" => [ "title" => заголовок кнопки поиска ]
     *           
     *      ]
     * ]
     */
    public function getFormRenderData (array $parameters) : array;
    
    /**
     * Получение данных для отображения результатов поиска
     * @param array $parameters
     * @return array [
     * 
     *      "pager" => [
     *          "count" => количество страниц,
     *          "page" => текущая страница
     *          "records" => общее число элементов
     *      ],
     * 
     *      "items" => [
     *          [
     *              "id" => id объекта,
     *              "name" => название,
     *              "stars" => звездность,
     *              "address" => адрес,
     *              "imgSrc" => относительный путь к изображению,
     *              "text" => [
     *                  "distance" => [
     *                      "center" => до центра
     *                      "airport" => до аэропорта
     *                  ],
     *                  "price" => цена
     *              ],
     *              request => параметры для поиска предложений
     *          ]
     *      ]
     * ]
     */
    public function getSearchResultRenderData (array $parameters) : array;
    
    /**
     * Получение данных для отображения предложений
     * @param array $parameters
     * @return array [
     *      [
     *          "date" => дата тура, если ищем экскурсии,
     *          "img_src" => изображение услуги (если нужно),
     *          "service" => название услуги (если нужно),
     *          "rate" => название тарифа (если нужно),
     *          "citizenprice" => приписка, что цена только для граждан РБ (если нужно)
     *          "price" => цена,
     *          "add2cart" => параметры для бронирования
     *      ]
     * ]
     */
    public function getOffersRenderData (array $parameters): array;
    
    /**
     * Выполняет процедуру бронирования
     * @param array $parameters
     * @return boolean
     */
    public function booking (array $parameters): bool;
            
}
