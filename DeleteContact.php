<?php

    // Deletes one of the user's contacts. UserID is part of the WHERE clause so
    // a user can only delete contacts that belong to them.
    $inData = getRequestInfo();

    $contactId = $inData["contactId"];
    $userId    = $inData["userId"];

    $conn = new mysqli("localhost", "SlimeGuy", "WeLoveSlime", "SlimeManager");
    if ($conn->connect_error)
    {
        returnError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
        $stmt->bind_param("ii", $contactId, $userId);

        if ($stmt->execute())
        {
            returnError("");
        }
        else
        {
            returnError($stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-Type: application/json');
        echo $obj;
    }

    function returnError($err)
    {
        sendResultInfoAsJson(json_encode(array("error" => $err)));
    }

?>
