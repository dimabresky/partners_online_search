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
     *          "rate_desc" => описание тарифа (если нужно),
     *          "citizenprice" => приписка, что цена только для граждан РБ (если нужно)
     *          "price" => цена,
     *          "add2cart" => параметры для бронирования
     *      ]
     * ]
     */
    public function getOffersRenderData (array $parameters): array;
    
    /**
     * Получение данных для отображения детального описания
     * @param array $parameters
     * @return array [
     *      "pictures" => [
     *          "big" => [], массив путей к большим картинкам
     *          "small" => [] массив путей к картинкам навигации
     *      ],
     *      "desc" => текст описания,
     *      "program" => программа тура (для экск. туров),
     *      "profiles" => [медицинские профили
     *          "TYPE_GROUP" => [], // структуру смотреть в реализации API в ветке vetliva на github
     *          "TYPE_SECTIONS" => [] // структуру смотреть в реализации API в ветке vetliva на github
     *      ],
     *      "services" => [ услуги
     *          "SERVICES_GROUP" => [], // структуру смотреть в реализации API в ветке vetliva на github
     *          "SERVICES_SECTIONS" => [] // структуру смотреть в реализации API в ветке vetliva на github
     *      ],
     *      "medicine_services" => [медицинские услуги
     *          "MED_SERVICES_GROUP" => [], // структуру смотреть в реализации API в ветке vetliva на github
     *          "MED_SERVICES_SECTIONS" => [] // структуру смотреть в реализации API в ветке vetliva на github
     *      ],
     *      "children_services" => текст услуги для детей,
     *      "rooms_base" => текст номерная база,
     *      "food" => текст питания,
     *      "addinfo" => текст доп. информации
     * ]
     */
    public function getDetailDescriptionRenderData (array $parameters): array;
    
    /**
     * Получение данных для отображения детального описания
     * @param array $parameters
     * @return array [
     *      [
     *          title => заголовок маркера,
     *          lat => долгота,
     *          lng => широта,
     *          icon => относительный путь к изображению маркера(необязательный),
     *          content => text/html описания маркера(необязательный)
     *      ]
     * ]
     */
    public function getDetailMapRenderData (array $parameters): array;
    
    /**
     * Получение данных для отображения видео
     * @param array $parameters
     * @return array [
     *      "code" => код видео youtube
     * ]
     */
    public function getDetailVideoRenderData (array $parameters) : array;
        
    /**
     * Выполняет процедуру бронирования
     * @param array $parameters
     */
    public function booking (array $parameters);
    
    /**
     * Получение стилей для страницы
     * @param array $parameters
     */
    public function getStylesheet (array $parameters);
            
}
