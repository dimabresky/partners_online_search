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

$agent_id = intVal($agent_id);

if ($agent_id > 0) {
    
    require "interfaces/API.php";
    require "API.php";
    
    $hash = travelsoft\pm\API::agentHashing((string)$agent_id);
    
} else {
    
    $agent_id = null;
    $hash = null;
}

ob_start();

require "views/code_generator/index.html";

$body = str_replace(array("{{agent}}", "{{hash}}"), array($agent_id, $hash), ob_get_clean());

echo $body;

