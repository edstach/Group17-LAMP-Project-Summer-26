<?php

    // Adds a new contact for the given user.
    $inData = getRequestInfo();

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
            "INSERT INTO Contacts (UserID, firstName, lastName, Phone, Email, MediaApp, MediaUsername, MediaIsLink, MediaLink)
             VALUES (?,?,?,?,?,?,?,?,?)"
        );
        $stmt->bind_param("issssssis",
            $userId, $firstName, $lastName, $phone, $email,
            $mediaApp, $mediaUsername, $mediaIsLink, $mediaLink
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
