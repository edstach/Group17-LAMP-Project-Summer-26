<?php

    // Returns every contact that belongs to the given user and matches the
    // search text (name, phone, or email). An empty search returns all of the
    // user's contacts.
    $inData = getRequestInfo();

    $searchResults = array();

    $conn = new mysqli("localhost", "SlimeGuy", "WeLoveSlime", "SlimeManager");
    if ($conn->connect_error)
    {
        returnError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare(
            "SELECT ID, firstName, lastName, Phone, Email, MediaApp, MediaUsername, MediaIsLink, MediaLink
             FROM Contacts
             WHERE (firstName LIKE ? OR lastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)
               AND UserID = ?"
        );

        $searchToken = "%" . $inData["search"] . "%";
        $userId = $inData["userId"];

        $stmt->bind_param("ssssi", $searchToken, $searchToken, $searchToken, $searchToken, $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc())
        {
            $searchResults[] = array(
                "id"            => intval($row["ID"]),   // the contact's real row ID (needed for edit/delete)
                "firstName"     => $row["firstName"],
                "lastName"      => $row["lastName"],
                "phone"         => $row["Phone"],
                "email"         => $row["Email"],
                "mediaApp"      => $row["MediaApp"],
                "mediaUsername" => $row["MediaUsername"],
                "mediaIsLink"   => $row["MediaIsLink"],
                "mediaLink"     => $row["MediaLink"]
            );
        }

        returnWithInfo($searchResults);

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
        sendResultInfoAsJson(json_encode(array("results" => array(), "error" => $err)));
    }

    function returnWithInfo($searchResults)
    {
        sendResultInfoAsJson(json_encode(array("results" => $searchResults, "error" => "")));
    }

?>
