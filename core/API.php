<?php

namespace travesoft\pm;

/**
 * Класс для реализации api получения данных поиска
 *
 * @author dimabresky
 * @copyright (c) 2017,  travelsoft
 */
class API implements interfaces\API {
    
    const DATE_SEPARATOR = "-";
    
    public function __construct() {

        require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
        \Bitrix\Main\Loader::includeModule("travelsoft.booking.dev.tools");
        \Bitrix\Main\Loader::includeModule("iblock");
    }

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
    public function getFormRenderData(array $parameters): array {

        $types = explode("|", $parameters["types"]);

        $result = array();

        if (empty($types)) {
            return $result;
        }

        $active = true; // first tab is active
        $titles = array(
            "excursions" => array(
                "tab" => "Экскурсии",
                "objects" => "Населенный пункт, экскурсия"
            ),
            "placements" => array(
                "tab" => "Проживание",
                "objects" => "Населенный пункт, гостиница"
            ),
            "sanatorium" => array(
                "tab" => "Санатории",
                "objects" => "Cанаторий, мед.профиль"
            ),
        );
        foreach ($types as $type) {

            # получение объектов поиска
            # их фильтрация по наличию цены
            $filterMethod = $type . "FilterByPriceExists";
            $storeID = \travelsoft\booking\Utils::getOpt($type);
            $ids = $this->$filterMethod($this->toCache($type . "GetArrayId", array("IBLOCK_ID" => $storeID, "ACTIVE" => "Y"), array("ID"), null));

            if ($ids) {
                // получение результата
                $result__ = $this->toCache($type . "GetResult", array("IBLOCK_ID" => $storeID, "ACTIVE" => "Y", "ID" => $ids), array("*"), null);

                if (!empty($result__)) {

                    $result[$type] = array(
                        "objects" => array(
                            "forSelect" => array(),
                            "title" => $titles[$type]["objects"]
                        ),
                        "tabIsActive" => $active,
                        "tabTitle" => $titles[$type]["tab"],
                        "dates" => array(
                            "title" => "Период проживания",
                            "separator" => self::DATE_SEPARATOR,
                            "format" => "DD.MM.YYYY",
                            "durationTitle" => "Продолжительность(дней)",
                            "inputValue" => $this->getDefDatesRange($type)
                        ),
                        "adults" => array("title" => "Взрослых"),
                        "children" => array(
                            "title" => "Детей",
                            "withoutChildrenTitle" => "Без детей",
                            "ageSelectTitleTemplate" => "{{index}}-й ребенок",
                            "ageTitle" => "Возраст детей"
                        ),
                        "button" => array(
                            "title" => "Найти"
                        )
                    );

                    foreach ($result__ as $res) {

                        $arrname = array();

                        $arrname[] = $res["name"];

                        if ($res['region']) {
                            $arrname[] = $res['region'];
                        }

                        $result[$type]["objects"]["forSelect"][] = array(
                            "id" => $res["id"],
                            "name" => implode(", ", $arrname),
                            "isSelected" => false
                        );
                    }
                }
            }
            $active = false;
        }

        return $result;
    }

    /**
     * Получение данных для отображения результатов поиска
     * @param array $parameters
     * @return array
     */
    public function getSearchResultRenderData(array $parameters): array {
        
        $request = null;
        if ($parameters["adults"] > 0) {
            $request["adults"] = $parameters["adults"];
        }
        if ($parameters["children"]) {
            $request["children"] = $parameters["children"];
            $request["children_age"] = $parameters["children_age"];
        }
        if (strlen($parameters["date_range"])) {
            $dates = explode(self::DATE_SEPARATOR, $parameters['date_range']);
            $request["date_from"] = strtotime($dates[0]);
            $request["date_to"] = strtotime($dates[1]);
        }
        
        $complex_logic = null;
        if ($request) {
            
            $complex_logic = array(array(
                "LOGIC" => "OR",
                array("ID" => $parameters['id']),
                // по городам
                array("PROPERTY_TOWN" => $request['id']),
                // по областям
                array("PROPERTY_REGION" => $request['id']),
                // по достопримечательностям
                array("PROPERTY_SIGHT" => $request['id']),
                // по мед. профилям
                array("PROPERTY_TYPE" => $request['id'])
            ));
        }
        
        $arFilter = array(
            "IBLOCK_ID" => \travelsoft\booking\Utils::getOpt($parameters["type"]),
            "ACTIVE" => "Y"
        );
        
        if ($complex_logic) {
            $arFilter = array_merge($arFilter, $complex_logic);
        }
        
        $arOrder = array("SORT" => "ASC");
        
        $arSelect = array(
            "ID", 
            "NAME",
            "PREVIEW_PICTURES",
            "PROPERTY_ADDRESS", 
            "PROPERTY_DISTANCE_CENTER", 
            "PROPERTY_DISTANCE_AIRPORT",
            "PROPERTY_PICTURES",
            "PROPERTY_CAT_ID"
        );
        
        $arNav = array(
            "nPageSize" => $parameters["number_per_page"] > 0 ? (int)$parameters["number_per_page"] : 10,
            "iNumPage" => $parameters["page"] > 1 ? (int)$parameters["page"] : 1
        );
        
        $dbList = $this->toCache("getSearchListResult", $arFilter, $arSelect, $arOrder, $arNav);
        $result = array();
        $starsMapping = array(
            1491 => 5,
            1492 => 4,
            1493 => 3,
            1494 => 2,
            4169 => 0
        );
        while ($arRes = $dbList->Fetch()) {
            
            $imgSrc = "";
            if ($arRes["PREVIEW_PICTURE"] > 0) {
                $resize = \CFile::ResizeImageGet($arRes["PREVIEW_PICTURE"], array('width' => 410, 'height' => 250), BX_RESIZE_IMAGE_EXACT, true, array(), false, 80);
                $imgSrc = $resize['src'];
            } elseif (!empty($arRes["PROPERTY_PICTURES_VALUE"])) {
                $resize = \CFile::ResizeImageGet($arRes["PROPERTY_PICTURES_VALUE"][0], array('width' => 410, 'height' => 250), BX_RESIZE_IMAGE_EXACT, true, array(), false, 80);
                $imgSrc = $resize['src'];
            }
            
            $result["items"][] = array(
                "name" => $arRes["NAME"],
                "stars" => $starsMapping[$arRes["PROPERTY_CAT_ID_VALUE"]],
                "address" => $arRes["PROPERTY_ADDRESS_VALUE"],
                "imgSrc" => $imgSrc,
                "text" => array(
                    "distance" => array(
                        "center" => "Расстояние до центра " .$arRes["PROPERTY_DISTANCE_CENTER_VALUE"]. " км",
                        "airport" => "Pасстояние до аэропорта " .$arRes["PROPERTY_DISTANCE_AIRPORT_VALUE"]. " км"
                    )
                )
            );
        }
        $result["navPageCount"] = $dbList->NavPageCount;
        $result["navPageNomer"] = $dbList->NavPageNomer;
        $result["navRecordCount"] = $dbList->NavRecordCount;
        return $result;
    }
    
    /**
     * @param type $arFilter
     * @param type $arSelect
     * @param type $arOrder
     * @param type $arNav
     */
    protected function getSearchListResult ($arFilter, $arSelect, $arOrder, $arNav) {
        
        return \CIBlockElement::GetList($arOrder, $arFilter, false, $arNav, $arSelect);
        
    }
    
    /**
     * Возвращает даты поиска по-умолчанию
     * @param string $type
     * @return string
     */
    protected function getDefDatesRange (string $type) {
        
        $timestamps = unserialize(\travelsoft\booking\Utils::getOpt($type . "DateRange"));
        
        return date("d.m.Y", $timestamps[0]) . "-" . date("d.m.Y", $timestamps[1]);
    }

    /**
     * @global $CACHE_MANAGER
     * @param array $callback
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @param array $arNav
     */
    protected function toCache($callback, $arFilter, $arSelect = array(), $arOrder = null, $arNav = null) {

        $oCache = \Bitrix\Main\Data\Cache::createInstance();

        $cacheDir = "/travelsoft/partners_module/" . $arFilter["IBLOCK_ID"];

        $cacheTime = 3600;

        $cacheid = serialize(func_get_args());

        if ($oCache->initCache($cacheTime, $cacheid, $cacheDir)) {
            $arResult = $oCache->getVars();
        } else {
            $arResult = $this->$callback($arFilter, $arSelect, $arOrder, $arNav);
            if ($arResult) {

                if (defined("BX_COMP_MANAGED_CACHE")) {
                    global $CACHE_MANAGER;
                    $CACHE_MANAGER->StartTagCache($cacheDir);
                    $CACHE_MANAGER->RegisterTag("iblock_id_" . $arFilter["IBLOCK_ID"]);
                    $CACHE_MANAGER->EndTagCache();
                }

                $oCache->endDataCache($arResult);
            } else {

                $oCache->abortDataCache();
            }
        }
        return $arResult;
    }

    /**
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array
     */
    protected function getArrayId($arFilter, $arSelect = array("*"), $arOrder = false) {

        $dbRes = \CIBlockElement::GetList($arOrder, $arFilter, false, false, $arSelect);

        $arResult = null;

        while ($arRes = $dbRes->Fetch()) {
            $arResult[] = $arRes["ID"];
        }

        return array("id" => $arResult);
    }

    /**
     * @param array $brp
     */
    protected function placementsFilterByPriceExists(array $brp) {
        return $this->filterByPriceExists($brp, "placements");
    }

    /**
     * @param array $brp
     */
    protected function sanatoriumFilterByPriceExists(array $brp) {
        return $this->filterByPriceExists($brp, "sanatorium");
    }

    /**
     * @param array $brp
     */
    protected function excursionsFilterByPriceExists(array $brp) {
        return $this->filterByPriceExists($brp, "excursions");
    }

    /**
     * при необходимости реализовать фильтрацию по наличию цены
     * функция должна будет возвращать массив ID объектов по которым есть цены
     * @param array $brp
     * @param string $type
     * @return array
     */
    protected function filterByPriceExists(array $brp, string $type) {

        return $brp["id"];
    }

    /**
     * ID объектов поиска для объектов размещения
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array
     */
    protected function placementsGetArrayId(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getArrayId($arFilter, $arSelect, $arOrder);
    }

    /**
     * ID объектов поиска для санаториев
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array
     */
    protected function sanatoriumGetArrayId(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getArrayId($arFilter, $arSelect, $arOrder);
    }

    /**
     * ID объектов поиска для санаториев
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array
     */
    protected function excursionsGetArrayId(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getArrayId($arFilter, $arSelect, $arOrder);
    }

    /**
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @param string $type
     * @return array
     */
    protected function getResult($arFilter, $arSelect = array("*"), $arOrder = false, $type) {
        $storeID = $arFilter["IBLOCK_ID"];
        unset($arFilter["IBLOCK_ID"]);
        $dbRes = \CIBlockElement::GetList($arOrder, $arFilter, false, false, $arSelect);

        $arResult = $arLinkCt = $arLinkMedProf = $arLinkSights = $arLinkRegions = null;

        while ($oElements = $dbRes->GetNextElement()) {

            $arFields = $oElements->GetFields();
            $arProperties = $oElements->GetProperties();

            if ($arFields["ID"] > 0) {
                $arResult[$arFields["ID"]]["id"] = $arFields["ID"];
                $arResult[$arFields["ID"]]["page"] = $arFields["DETAIL_PAGE_URL"];
                $arResult[$arFields["ID"]]["city"] = "";
                $arResult[$arFields["ID"]]["region"] = "";
                $arResult[$arFields["ID"]]["type"] = $type;

                # города
                if (in_array("TOWN", $_SESSION["TSBSFC_additionalGet"][$type][$storeID])) {
                    if ($arProperties["TOWN"]["VALUE"] > 0) {
                        $arID = (array) $arProperties["TOWN"]["VALUE"];
                        $arLinkCt[$arID[0]][] = $arFields["ID"];
                    } elseif ($arProperties["REGION"]["VALUE"] > 0) {
                        $arLinkRegions[$arProperties["REGION"]["VALUE"]][] = $arFields["ID"];
                    }
                }

                # мед. профиль
                if (in_array("TYPE", $_SESSION["TSBSFC_additionalGet"][$type][$storeID]) &&
                        $arProperties["TYPE"]["VALUE"]) {
                    $arID = (array) $arProperties["TYPE"]["VALUE"];
                    $arLinkMedProf[$arID[0]][] = $arFields["ID"];
                }

                # подклеивать тип объекта к имени элемента
                $namePrefix = "";
                if (in_array("ADD_TYPE_TO_NAME", $_SESSION["TSBSFC_additionalGet"][$type][$storeID])) {

                    if ($arProperties["TYPE2"]["VALUE"] > 0) {
                        $namePrefix = $this->getNamePrefix($arProperties["TYPE2"]["VALUE"]) . " ";
                    } elseif ($arProperties["TYPE"]["VALUE"]) {
                        if (is_array($arProperties["TYPE"]["VALUE"]) && $arProperties["TYPE"]["VALUE"][0] > 0) {
                            $typeId = $arProperties["TYPE"]["VALUE"][0];
                        } else {
                            $typeId = $arProperties["TYPE"]["VALUE"];
                        }
                        $namePrefix = $this->getNamePrefix($typeId) . " ";
                    }
                }

                $arResult[$arFields["ID"]]["name"] = $namePrefix . $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);
            }
        }

        if ($arLinkCt) {

            $dbCtRes = \CIBlockElement::GetList(false, array("ID" => array_keys($arLinkCt)), false, false);
            while ($oCity = $dbCtRes->GetNextElement()) {

                $arFields = $oCity->GetFields();
                $arProperties = $oCity->GetProperties();

                if ($arFields["ID"]) {
                    $arResult[$arFields["ID"]]["id"] = $arFields["ID"];
                    $arResult[$arFields["ID"]]["name"] = $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);
                    $arResult[$arFields["ID"]]["region"] = "";

                    if ($arProperties["REGION"]["VALUE"]) {
                        $arLinkRegions[$arProperties["REGION"]["VALUE"]][] = $arFields["ID"];
                    }

                    for ($i = 0, $cnt = count($arLinkCt[$arFields["ID"]]); $i < $cnt; $i++) {
                        $arResult[$arLinkCt[$arFields["ID"]][$i]]["city"] = $arResult[$arFields["ID"]]["name"];
                    }
                }
            }
        }

        if ($arLinkRegions) {

            $dbRegionRes = \CIBlockElement::GetList(false, array("ID" => array_keys($arLinkRegions)), false, false);
            while ($oRegion = $dbRegionRes->GetNextElement()) {

                $arFields = $oRegion->GetFields();
                $arProperties = $oRegion->GetProperties();

                if ($arFields["ID"]) {

                    $name = $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);

                    if (!in_array("NOT_SHOW_REGIONS_LIKE_OBJECT", $_SESSION["TSBSFC_additionalGet"][$type][$storeID])) {
                        $arResult[$arFields["ID"]]["id"] = $arFields["ID"];
                        $arResult[$arFields["ID"]]["name"] = $name;
                    }

                    for ($i = 0, $cnt = count($arLinkRegions[$arFields["ID"]]); $i < $cnt; $i++) {
                        $arResult[$arLinkRegions[$arFields["ID"]][$i]]["region"] = $name;
                        for ($j = 0, $cnt2 = count($arLinkCt[$arLinkRegions[$arFields["ID"]][$i]]); $j < $cnt2; $j++) {
                            $arResult[$arLinkCt[$arLinkRegions[$arFields["ID"]][$i]][$j]]["region"] = $name;
                        }
                    }
                }
            }
        }

        if ($arLinkMedProf) {

            $dbMedProf = \CIBlockElement::GetList(false, array("ID" => array_keys($arLinkMedProf)), false, false);
            while ($oMedProfi = $dbMedProf->GetNextElement()) {

                $arFields = $oMedProfi->GetFields();
                $arProperties = $oMedProfi->GetProperties();

                if ($arFields["ID"]) {
                    $arResult[$arFields["ID"]]["id"] = $arFields["ID"];
                    $arResult[$arFields["ID"]]["name"] = $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);
                }
            }
        }

        return $arResult;
    }

    /**
     * Результат поиска объектов для размещений
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array|null
     */
    protected function placementsGetResult(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getResult($arFilter, $arSelect, $arOrder, "placements");
    }

    /**
     * Результат поиска объектов для санаториев
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array|null
     */
    protected function sanatoriumGetResult(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getResult($arFilter, $arSelect, $arOrder, "sanatorium");
    }

    /**
     * Результат поиска объектов для экскурсий
     * @param array $arFilter
     * @param array $arSelect
     * @param array $arOrder
     * @return array|null
     */
    protected function excursionsGetResult(array $arFilter, array $arSelect = array("*"), array $arOrder = null) {
        return $this->getResult($arFilter, $arSelect, $arOrder, "excursions");
    }

    /**
     * возвращает имя в зависимости от языка
     * @param string $name
     * @param string $namebyLang
     * @return string
     */
    protected function getName($name, $namebyLang) {

        if (LANGUAGE_ID == "ru") {
            return $name;
        }

        return $namebyLang;
    }

    /**
     * @param int $id
     * @return string
     */
    protected function getNamePrefix(int $id) {
        $oEL = \CIBlockElement::GetByID($id)->GetNextElement();
        $arFields = $oEL->GetFields();
        $arProperties = $oEL->GetProperties();
        return $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);
    }

}
