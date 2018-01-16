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

    protected $salt = "0ce42c55e079e52567257eec146a2583";
    
    protected $_allowedDirTarget = array(
        "redirect"
    );

    public function __construct() {

        require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
        \Bitrix\Main\Loader::includeModule("travelsoft.booking.dev.tools");
        \Bitrix\Main\Loader::includeModule("iblock");
    }

    /**
     * @param array $parameters
     * @return array
     */
    public function getFormRenderData(array $parameters): array {

        $types = explode("|", $parameters["types"]);

        $result = array();

        if (empty($types)) {
            return $result;
        }

        $active = strlen($parameters["active"]) ? $parameters["active"] : $parameters["type"][0];


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
                        "tabIsActive" => $active === $type,
                        "tabTitle" => $titles[$type]["tab"],
                        "dates" => array(
                            "title" => "Период проживания",
                            "separator" => self::DATE_SEPARATOR,
                            "format" => "DD.MM.YYYY",
                            "durationTitle" => "Продолжительность(дней)",
                            "defValue" => $parameters["date_range"] ? $parameters["date_range"] : $this->getDefDatesRange($type)
                        ),
                        "adults" => array("title" => "Взрослых", "defValue" => $parameters["adults"] > 0 ? (int) $parameters["adults"] : 2),
                        "children" => array(
                            "title" => "Детей",
                            "totalSelectTitle" => "Сколько?",
                            "defValue" => $parameters["children"] > 0 ? (int) $parameters["children"] : 0
                        ),
                        "children_age" => array(
                            "defValue" => is_array($parameters["children_age"]) && !empty($parameters["children_age"]) ? $parameters["children_age"] : array(),
                        ),
                        "button" => array(
                            "title" => "Найти"
                        )
                    );

                    foreach ($result__ as $res) {

                        $arrname = array();

                        $arrname[] = $res["name"];

                        if ($res['city']) {
                            $arrname[] = $res['city'];
                        }

                        if ($res['region']) {
                            $arrname[] = $res['region'];
                        }

                        $result[$type]["objects"]["forSelect"][] = array(
                            "id" => $res["id"],
                            "source_name" => $res["name"],
                            "name" => implode(", ", $arrname),
                            "isSelected" => in_array($res["id"], $parameters["id"])
                        );
                    }
                }
            }
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
        } else {
            $request["adults"] = 2;
        }

        if ($parameters["children"]) {
            $request["children"] = $parameters["children"];
            $request["children_age"] = $parameters["children_age"];
        }
        if (strlen($parameters["date_range"])) {
            $dates = explode(self::DATE_SEPARATOR, $parameters['date_range']);
            $request["date_from"] = strtotime($dates[0]);
            $request["date_to"] = strtotime($dates[1]);
        } else {
            $dates = explode(self::DATE_SEPARATOR, $this->getDefDatesRange($parameters["type"]));
            $request["date_from"] = strtotime($dates[0]);
            $request["date_to"] = strtotime($dates[1]);
        }

        $complex_logic = null;
        if ($parameters["id"]) {

            $complex_logic = array(array(
                    "LOGIC" => "OR",
                    array("ID" => $parameters['id']),
                    // по городам
                    array("PROPERTY_TOWN" => $parameters['id']),
                    // по областям
                    array("PROPERTY_REGION" => $parameters['id']),
                    // по достопримечательностям
                    array("PROPERTY_SIGHT" => $parameters['id']),
                    // по мед. профилям
                    array("PROPERTY_TYPE" => $parameters['id'])
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

        $arSelect = null;

        $arNav = array(
            "nPageSize" => $parameters["number_per_page"] > 0 ? (int) $parameters["number_per_page"] : 10,
            "iNumPage" => $parameters["page"] > 1 ? (int) $parameters["page"] : 1
        );

        return $this->toCache("getSearchListResult", $arFilter, $arSelect, $arOrder, $arNav, array(
                    "type" => $parameters["type"],
                    "agent" => $parameters["agent"],
                    "hash" => $parameters["hash"],
                    "request" => $request
        ));
    }

    /**
     * Бронирование
     * @param array $parameters
     */
    public function booking(array $parameters) {

        try {
            $bookData = $this->add2CartUnHashing($parameters["add2cart"])["data"];
            $basketItemClass = "travelsoft\\booking\\" . $bookData["type"] . "\BasketItem";
            (new \travelsoft\booking\Basket)->add(new $basketItemClass($bookData));
            ob_start();
            require "views/redirect/index.html";
            $body = ob_get_clean();
            header('Content-Type: text/html; charset=utf-8');
            echo $body;
        } catch (\Exception $e) {
            (new Logger(__DIR__ . "log.txt"))->wrire($e->getMessage());
            header('Content-Type: text/html; charset=utf-8');
            echo "Произошла ошибка при бронировании. Повторите бронирование через 5 минут.";
        }

        die;
    }

    /**
     * Получение данных для отображения предложений
     * @param array $parameters
     * @return array
     */
    public function getOffersRenderData(array $parameters): array {

        $type = $parameters["type"];

        $method = "get" . ucfirst($type) . "OffersRenderData";

        unset($parameters["type"]);

        return $this->$method((array) $this->getOffers(array(
                            "RETURN_RESULT" => "Y",
                            "FILTER_BY_PRICES_FOR_CITIZEN" => "N",
                            "TYPE" => $type,
                            "__BOOKING_REQUEST" => $parameters
                        )), $parameters);
    }

    protected function getCommonOffersRenderData(array $offers, array $parameters, string $type): array {

        if (empty($offers)) {
            return array();
        }

        $result = $arRates = $arServices = array();

        foreach ($offers as $arrservdata) {

            foreach ($arrservdata as $sid => $arrratesdata) {

                if (!isset($arService[$sid])) {
                    $arService[$sid] = current(\travelsoft\booking\datastores\ServicesDataStore::get(array("filter" => array("ID" => $sid), "select" => array("UF_NAME", "ID", "UF_PICTURES"))));
                }

                foreach ($arrratesdata as $rid => $arrdata) {

                    if (!isset($arRates[$rid])) {
                        $arRates[$rid] = current(\travelsoft\booking\datastores\RatesDataStore::get(array("filter" => array("ID" => $rid), "select" => array("UF_NAME", "ID", "UF_BR_PRICES"))));
                    }

                    $currency_id = $this->getCurrencyIdByCode("BYN");
                    $add2cart = array(
                        "service_id" => (int) $sid,
                        "rate_id" => (int) $rid,
                        "adults" => (int) $parameters["adults"],
                        "currency" => $currency_id,
                        "can_buy" => true,
                        "date_from" => $parameters["date_from"],
                        "date_to" => $parameters["date_to"],
                        "duration" => $arrdata["DURATION"] + 1,
                        "children" => (int) $parameters["children"],
                        "children_age" => $parameters["children_age"],
                        "type" => $type,
                        "price" => \travelsoft\booking\Utils::convertCurrency($arrdata["PRICE"], $arrdata["CURRENCY_ID"], $currency_id, true),
                        "agent" => (int) $parameters["agent"]
                    );

                    $img_src = null;
                    if (!empty($arService[$sid]["UF_PICTURES"])) {
                        $resize = \CFile::ResizeImageGet($arService[$sid]["UF_PICTURES"][0], array('width' => 410, 'height' => 250), BX_RESIZE_IMAGE_EXACT, true, array(), false, 80);
                        $img_src = $resize['src'];
                    }

                    $result[] = array(
                        "date" => null,
                        "img_src" => $img_src,
                        "service" => $arService[$sid]["UF_NAME"],
                        "rate" => $arRates[$rid]["UF_NAME"],
                        "citizenprice" => $arRates[$rid]["UF_BR_PRICES"] ? "(для граждан РБ)" : null,
                        "price" => \travelsoft\booking\Utils::convertCurrency($arrdata["PRICE"], $arrdata["CURRENCY_ID"], $currency_id),
                        "add2cart" => $this->add2CartHashing($add2cart)
                    );
                }
            }
        }

        return $result;
    }

    /**
     * @param array $parameters
     */
    public function getStylesheet(array $parameters) {
        $file = __DIR__ . "/views/" . $parameters["target"] . "/styles.css";
        if (
                in_array($parameters["target"], $this->_allowedDirTarget) &&
                $parameters["target"] &&
                file_exists($file)
        ) {
            ob_start();
            require $file;
            $body = ob_get_clean();
            header('Content-Type: text/css; charset=utf-8');
            echo $body;
            die;
        }

        header("HTTP/1.0 404 Not Found");
        die;
    }
    
    /**
     * @param array $parameters
     */
    public function getScript(array $parameters) {
        $file = __DIR__ . "/views/" . $parameters["target"] . "/script.js";
        if (
                in_array($parameters["target"], $this->_allowedDirTarget) &&
                $parameters["target"] &&
                file_exists($file)
        ) {

            ob_start();
            require $file;
            $body = ob_get_clean();
            header('Content-Type: application/javascript; charset=utf-8');
            echo $body;
            die;
        }

        header("HTTP/1.0 404 Not Found");
        die;
    }

    protected function getPlacementsOffersRenderData(array $offers, array $parameters): array {

        return $this->getCommonOffersRenderData($offers, $parameters, "placements");
    }

    protected function getSanatoriumOffersRenderData(array $offers, array $parameters): array {

        return $this->getCommonOffersRenderData($offers, $parameters, "sanatorium");
    }

    protected function getExcursionsOffersRenderData(array $offers, array $parameters): array {

        if (empty($offers)) {
            return array();
        }

        $result = $arRates = array();

        foreach ($offers as $arrservdata) {

            foreach ($arrservdata as $sid => $arrtsdata) {

                foreach ($arrtsdata as $timestamp => $arrratesdata) {

                    foreach ($arrratesdata as $rid => $arrdata) {

                        if (!isset($arRates[$rid])) {
                            $arRates[$rid] = current(\travelsoft\booking\datastores\RatesDataStore::get(array("filter" => array("ID" => $rid), "select" => array("UF_NAME", "ID"))));
                        }

                        $currency_id = $this->getCurrencyIdByCode("BYN");
                        $add2cart = array(
                            "service_id" => (int) $sid,
                            "rate_id" => (int) $rid,
                            "adults" => (int) $parameters["adults"],
                            "currency" => $currency_id,
                            "can_buy" => true,
                            "date_from" => $parameters["date_from"],
                            "date_to" => $parameters["date_to"],
                            "duration" => $arrdata["DURATION"],
                            "children" => (int) $parameters["children"],
                            "children_age" => $parameters["children_age"],
                            "type" => "excursions",
                            "price" => \travelsoft\booking\Utils::convertCurrency($arrdata["PRICE"], $arrdata["CURRENCY_ID"], $currency_id, true),
                            "agent" => (int) $parameters["agent"]
                        );

                        $result[] = array(
                            "date" => date('d.m.Y', $timestamp),
                            "img_src" => null,
                            "service" => null,
                            "rate" => $arRates[$rid]["UF_NAME"],
                            "citizenprice" => null,
                            "price" => \travelsoft\booking\Utils::convertCurrency($arrdata["PRICE"], $arrdata["CURRENCY_ID"], $currency_id),
                            "add2cart" => $this->add2CartHashing($add2cart)
                        );
                    }
                }
            }
        }

        return $result;
    }

    /**
     * @param string $code
     * @return int
     */
    protected function getCurrencyIdByCode(string $code) {

        foreach (\travelsoft\booking\Utils::getAllCurrency() as $id => $arCurrency) {
            if ($arCurrency['iso'] === $code) {
                return $id;
            }
        }

        return 0;
    }

    /**
     * @param array $add2Cart
     * @return string
     */
    protected function add2CartHashing(array $add2Cart) {

        return base64_encode(
                serialize(array("data" => $add2Cart, "hash" => md5(serialize($add2Cart) . $this->salt))));
    }

    /**
     * @param string $hash
     * @return array
     * @throws \Exception
     */
    protected function add2CartUnHashing(string $hash) {

        $unsdata = unserialize(base64_decode($hash));

        if (md5(serialize($unsdata["data"]) . $this->salt) === $unsdata["hash"]) {
            return $unsdata;
        }

        throw new \Exception("Неверный хеш данных. Данные: " . json_encode($unsdata));
    }

    /**
     * @param array $parameters
     * @return array
     */
    protected function getOffers($parameters) {

        return $GLOBALS["APPLICATION"]->IncludeComponent(
                        "travelsoft:travelsoft.service.price.result", "", $parameters
        );
    }

    /**
     * @param type $arFilter
     * @param type $arSelect
     * @param type $arOrder
     * @param type $arNav
     * @param array $other
     */
    protected function getSearchListResult($arFilter, $arSelect, $arOrder, $arNav, $other) {

        $dbList = \CIBlockElement::GetList(false, $arFilter, false, false, array("ID"));

        $result = array();

        $other["request"]["id"] = array();
        while ($arRes = $dbList->Fetch()) {
            $other["request"]["id"][] = $arRes["ID"];
        }

        if (!empty($other["request"]["id"])) {

            $arOffers = $this->getOffers(array(
                "RETURN_RESULT" => "Y",
                "FILTER_BY_PRICES_FOR_CITIZEN" => "N",
                "TYPE" => $other["type"],
                "__BOOKING_REQUEST" => $other["request"],
                "MP" => "Y"
            ));

            $eid = array_keys($arOffers);

            $arFilter["ID"] = !empty($eid) ? $eid : -1;

            $dbList2 = \CIBlockElement::GetList($arOrder, $arFilter, false, $arNav, $arSelect);

            $starsMapping = array(
                1491 => 5,
                1492 => 4,
                1493 => 3,
                1494 => 2,
                4169 => 0
            );

            $result["pager"]["count"] = (int) $dbList2->NavPageCount;
            $result["pager"]["page"] = (int) $dbList2->NavPageNomer;
            $result["pager"]["records"] = (int) $dbList2->NavRecordCount;
            $result["items"] = array();

            if ($result["pager"]["records"] > 0) {
                $hashIsValid = $this->checkAgentHash((string) $other["agent"], (string) $other["hash"]);
                unset($other["request"]["id"]);
                $request = array();
                foreach ($other["request"] as $k => $v) {
                    $p = "tpm_params[$k]";
                    if (is_array($v)) {
                        foreach ($v as $vv) {
                            $request[] = $p . "[]=" . $vv;
                        }
                    } else {
                        $request[] = $p . "=" . $v;
                    }
                }
                while ($el = $dbList2->GetNextElement()) {
                    $arFields = $el->GetFields();
                    $arProperties = $el->GetProperties();
                    $imgSrc = "";
                    if (!empty($arProperties["PICTURES"]["VALUE"])) {
                        $resize = \CFile::ResizeImageGet($arProperties["PICTURES"]["VALUE"][0], array('width' => 410, 'height' => 250), BX_RESIZE_IMAGE_EXACT, true, array(), false, 80);
                        $imgSrc = $resize['src'];
                    } elseif ($arFields["PREVIEW_PICTURE"]) {
                        $resize = \CFile::ResizeImageGet($arFields["PREVIEW_PICTURE"], array('width' => 410, 'height' => 250), BX_RESIZE_IMAGE_EXACT, true, array(), false, 80);
                        $imgSrc = $resize['src'];
                    }


                    $result["items"][] = array(
                        "id" => $arFields["ID"],
                        "name" => $arFields["NAME"],
                        "stars" => $starsMapping[$arProperties["CAT_ID"]["VALUE"]],
                        "imgSrc" => $imgSrc,
                        "text" => array(
                            "address" => $arProperties["ADDRESS"]["VALUE"] ? $arRes["ADDRESS"]["VALUE"] : null,
                            "route" => $arProperties["ROUTE"]["VALUE"] ? $arProperties["ROUTE"]["VALUE"] : null,
                            "days" => $arProperties["DAYS"]["VALUE"] ? "Количество дней: " . $arProperties["DAYS"]["VALUE"] : null,
                            "duration_time" => $arProperties["DURATION_TIME"]["VALUE"] ? "Количество часов: " . $arProperties["DURATION_TIME"]["VALUE"] : null,
                            "distance" => array(
                                "center" => $arProperties["DISTANCE_CENTER"]["VALUE"] ? "Расстояние до центра " . $arProperties["DISTANCE_CENTER"]["VALUE"] . " км" : null,
                                "airport" => $arProperties["DISTANCE_AIRPORT"]["VALUE"] ? "Pасстояние до аэропорта " . $arProperties["DISTANCE_AIRPORT"]["VALUE"] . " км" : null
                            ),
                            "price" => "От " . \travelsoft\booking\Utils::convertCurrency($arOffers[$arFields["ID"]]["PRICE"], $arOffers[$arFields["ID"]]["CURRENCY_ID"], $this->getCurrencyIdByCode("BYN")) . "/ночь"
                        ),
                        "request" => array_merge(array(
                            "tpm_params[id][]=" . $arFields["ID"],
                            "tpm_params[type]=" . $other["type"],
                            "tpm_params[agent]=" . ($hashIsValid ? $other["agent"] : ""),
                            "tpm_params[hash]=" . ($hashIsValid ? $other["hash"] : "")), $request)
                    );
                }
            }
        }

        return $result;
    }

    /**
     * @param string $agent
     * @param string $hash
     * @return boolean
     */
    protected function checkAgentHash(string $agent, string $hash) {

        return md5($agent . $this->salt) === $hash;
    }

    /**
     * @param string $agent
     * @return string
     */
    protected function agentHashing(string $agent) {
        return md5($agent . $this->salt);
    }

    /**
     * Возвращает даты поиска по-умолчанию
     * @param string $type
     * @return string
     */
    protected function getDefDatesRange(string $type) {

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
     * @param array $other
     * @return array
     */
    protected function toCache($callback, $arFilter, $arSelect = array(), $arOrder = null, $arNav = null, $other = null) {

        $oCache = \Bitrix\Main\Data\Cache::createInstance();

        $cacheDir = "/travelsoft/partners_module/" . $arFilter["IBLOCK_ID"];

        $cacheTime = 3600;

        $cacheid = serialize(func_get_args());

        if ($oCache->initCache($cacheTime, $cacheid, $cacheDir)) {
            $arResult = $oCache->getVars();
        } elseif ($oCache->startDataCache()) {
            $arResult = $this->$callback($arFilter, $arSelect, $arOrder, $arNav, $other);
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
                if ($arProperties["TOWN"]["VALUE"] > 0) {
                    $arID = (array) $arProperties["TOWN"]["VALUE"];
                    $arLinkCt[$arID[0]][] = $arFields["ID"];
                }

                # регионы
                if ($arProperties["REGION"]["VALUE"] > 0) {
                    $arLinkRegions[$arProperties["REGION"]["VALUE"]][] = $arFields["ID"];
                }

                # мед. профиль
                if ($arProperties["TYPE"]["VALUE"]) {
                    $arID = (array) $arProperties["TYPE"]["VALUE"];
                    $arLinkMedProf[$arID[0]][] = $arFields["ID"];
                }

                $arResult[$arFields["ID"]]["name"] = $this->getName($arFields["NAME"], $arProperties["NAME" . POSTFIX_PROPERTY]["VALUE"]);
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
