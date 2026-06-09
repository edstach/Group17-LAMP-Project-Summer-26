<?php

    // Verifies a username/password against the Users table. Passwords are stored
    // hashed (see Register.php), so we compare with password_verify().
    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "SlimeGuy", "WeLoveSlime", "SlimeManager");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
    else
    {
        $stmt = $conn->prepare("SELECT ID, firstName, lastName, Password FROM Users WHERE Login = ?");
        $stmt->bind_param("s", $inData["login"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc())
        {
            if (password_verify($inData["password"], $row['Password']))
            {
                returnWithInfo($row['firstName'], $row['lastName'], $row['ID']);
            }
            else
            {
                returnWithError("Username / password combination incorrect.");
            }
        }
        else
        {
            returnWithError("Username / password combination incorrect.");
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

    function returnWithError($err)
    {
        sendResultInfoAsJson(json_encode(array(
            "id"        => 0,
            "firstName" => "",
            "lastName"  => "",
            "error"     => $err
        )));
    }

    function returnWithInfo($firstName, $lastName, $id)
    {
        sendResultInfoAsJson(json_encode(array(
            "id"        => intval($id),
            "firstName" => $firstName,
            "lastName"  => $lastName,
            "error"     => ""
        )));
    }

?>
