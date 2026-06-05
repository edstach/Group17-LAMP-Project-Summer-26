<?php

    $inData = getRequestInfo();

    $id = 0;
    $firstName = " ";
    $lastName = " ";

    $conn = new mysqli("localhost", "SlimeGuy" , "WeLoveSlime", "SlimeManager");
    if( $conn->connect_error)
        {
            returnWithError( $conn->connect_error );
        }
        else
        {   
            $stmt = $conn->prepare("SELECT ID,firstName,lastName FROM Users WHERE Login=? AND Password =?");
            $stmt->bind_param("ss",$inData["login"], $inData["password"]);
            $stmt->execute();
            $result = $stmt->get_result();

            if( $row = $result->fetch_assoc()   )
            {
                returnWithInfo( $row['firstName'], $row['lastname'], $row['ID']);
            }
            else
            {
                returnWithError("Records not found");
            }

            $stmt->close();
            $conn->close();
        }   

        function getRequestInfo()
        {
            return('Content-type: application/json');
            echo $obj;
        }

        function sendResultInfoAsJson( $obj )
        {
            header('content-type: application/json');
            echo $obj;
        }

        function returnWithError( $err )
        {
            $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
