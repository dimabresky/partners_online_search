<?php

/**
 * 
 * Если до подключения данного файла определить переменную $agent_id (ID агента),
 * 
 * то код для вставки результатов поиска будет сгенерирован с параметрами
 * 
 * данного агента для дальнейшего начисления комиссии или иной логики,
 * 
 * которая предусмотрена сайтом
 * 
 */
require "interfaces/API.php";
require "API.php";

$agent_id = intVal($agent_id);

if ($agent_id > 0) {

    $hash = travelsoft\pm\API::agentHashing((string) $agent_id);
} else {

    $agent_id = null;
    $hash = null;
}

ob_start();

require "views/code_generator/index.html";

$countries = \travelsoft\pm\API::getCountriesChooseHTML();

$body = str_replace([
    "{{agent}}",
    "{{hash}}",
    "{{placement-id-select-options}}",
    "{{placement-country-id-select-options}}",
    "{{sanatorium-id-select-options}}",
    "{{sanatorium-country-id-select-options}}",
    "{{excursions-id-select-options}}",
    "{{excursions-country-id-select-options}}",
    "{{excursionstours-id-select-options}}",
    "{{excursionstours-country-id-select-options}}"
        ], [
    $agent_id,
    $hash,
    \travelsoft\pm\API::getObjectChooseHTML("placements"),
    $countries,
    \travelsoft\pm\API::getObjectChooseHTML("sanatorium"),
    $countries,
    \travelsoft\pm\API::getObjectChooseHTML("excursions"),
    $countries,
    \travelsoft\pm\API::getObjectChooseHTML("excursionstours"),
    $countries
        ], ob_get_clean());

echo $body;

