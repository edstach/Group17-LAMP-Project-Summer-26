<?php

    $inData = getRequestInfo();

    $userID = $inData["userID"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];

    $conn = new mysqli(localhost, username, password, "database")
    if($conn->conn_error)
        {
            returnError( $conn->conn_error );
        }
        else
        {

            $stmt = $conn->prepare("INSERT into Contacts (UserId, firstName, lastName, Phone, Email) VALUES(?,?,?,?,?)");

            $stmt->bind_param("sssss", $userID, $firstName, $lastName, $phone, $email);

            if ($stmt->execute()) 
            {
                returnError(" ");
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

            function jsonInfo( $obj )
            {
               header('Content-type: application/json');
               echo $obj;
            }

            function returnError( $err )
            {
                $retValue = '{"error": "' . $err . '"}';
                jsonInfo( $retValue );
            }
?>