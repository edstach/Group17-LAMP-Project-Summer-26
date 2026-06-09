<?php

    // Updates one of the user's contacts. The WHERE clause includes UserID so a
    // user can only edit contacts that belong to them.
    $inData = getRequestInfo();

    $contactId     = $inData["contactId"];
    $userId        = $inData["userId"];
    $firstName     = $inData["firstName"];
    $lastName      = $inData["lastName"];
    $phone         = $inData["phone"];
    $email         = $inData["email"];
    $mediaApp      = $inData["mediaApp"];
    $mediaUsername = $inData["mediaUsername"];
    $mediaIsLink   = $inData["mediaIsLink"];
    $mediaLink     = $inData["mediaLink"];

    $conn = new mysqli("localhost", "SlimeGuy", "WeLoveSlime", "SlimeManager");
    if ($conn->connect_error)
    {
        returnError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare(
            "UPDATE Contacts
             SET firstName=?, lastName=?, Phone=?, Email=?, MediaApp=?, MediaUsername=?, MediaIsLink=?, MediaLink=?
             WHERE ID=? AND UserID=?"
        );
        // Bind order matches the columns above, then ID, then UserID.
        $stmt->bind_param("ssssssisii",
            $firstName, $lastName, $phone, $email,
            $mediaApp, $mediaUsername, $mediaIsLink, $mediaLink,
            $contactId, $userId
        );

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
