<?php

    $inData = requestInfo();

    $searchResults = array();
    $searchCount = 0;
    
    $conn = new mysqli("localhost", username, password, database); 
    if ($conn->conn_error)
    {
        returnError( $conn->conn_error );
    }
    else
    {
    
        $stmt = $conn->prepare("SELECT UserId, firstName, lastName, Phone, Email FROM Contacts WHERE (firstName LIKE ? OR lastName LIKE ?) AND UserID = ?");

        $searchToken = "%" . $inData["search"] . "%";

        $stmt->bind_param("ssi", $searchToken, $searchToken, $inData["userId"]);
        $stmt->execute();

        $result = $stmt->get_result();

        while($row = $result->fetch_assoc())
        {
            $searchResults[] = array(
                "id" => $row["UserId"],
                "firstName" => $row["firstName"],
                "lastName" => $row["lastName"],
                "phone" => $row["Phone"],
                "email" => $row["Email"],
            );
            $searchCount++;
        }

        if( $searchCount == 0)
        {
            returnError( "No records found.");
        }
        else
        {
            returnWithInfo( $searchResults );
        }

        $stmt->close();
        $conn->close();
    }

    function requestInfo()
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
        $retValue = '{"results":[],"error":"' . $err . '"}';
        jsonInfo( $retValue );
    }

    function returnWithInfo( $searchResults )
    {
        $retValue = json_encode(array("results" => $searchResults, "error" => ""));
        jsonInfo( $retValue );
    }

?>
