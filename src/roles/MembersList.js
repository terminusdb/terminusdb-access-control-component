
import React, {useState,useEffect} from "react"
import {Row, Card, Col, Badge,Button} from "react-bootstrap"
import {RiDeleteBin7Line} from "react-icons/ri"
import {AiOutlineDatabase} from "react-icons/ai"
import {GrUserAdmin} from "react-icons/gr"
import {WOQLTable} from '@terminusdb/terminusdb-react-table'
import {getUsersListConfig,getUsersDatabaseListConfig} from "../ViewConfig"
import {AccessControlHook} from "../hooks/AccessControlHook"
import {RoleListModal} from "./RoleList"
import {formatCell} from "./formatData"
import {UserDatabasesList} from "./UserDatabasesList"

export const MembersList = ({team,currentUser,accessControlDashboard,options}) => {  
    if(!accessControlDashboard)return ""

    const [selectTeamRow,setSelectTeamRow]=useState(null)
    const [currentRoleToUpdate,setCurrentRoleToUpdate]=useState(null)
    const [show, setShow] = useState(false)
    const roles = accessControlDashboard.getRolesList()

    const localUser = currentUser || {}
 
    const {deleteUserFromOrganization,getOrgUsers,orgUsers,createUserRole,
          updateUserRole,
          loading,
          errorMessage,
          successMessage} =  AccessControlHook(accessControlDashboard)
    
    //to be review the roles list doesn't change
    useEffect(() => {
        getOrgUsers(team,true)
    }, [team])

    const orgUserArr = Array.isArray(orgUsers) ? orgUsers : []
    let rowCount=orgUserArr.length  

    //if not capability I create the role
    const changeUserRoleForScope= (currentSelected)=>{
        setCurrentRoleToUpdate(currentSelected)
        setShow(true)
    }

    // maybe move in hook
    const changeUserRole = (role) =>{
        //alert(role)
        if(currentRoleToUpdate.capability){
            updateUserRole(team,currentRoleToUpdate.userid,currentRoleToUpdate.capability,role,currentRoleToUpdate.scope).then(()=>{
                if(!errorMessage){
                    setShow(false)
                } 
            })
        }else{
            createUserRole(team,currentRoleToUpdate.userid,role,currentRoleToUpdate.scope).then(()=>{
                if(!errorMessage){
                    setShow(false)
                }
            })
        }
    }

    const deleteUserItem = (userId)=>{
        deleteUserFromOrganization(team,userId)
        setSelectTeamRow(null)
    }
    
    //when I get the database list I save the user selected in the table
    const getUserDatabaseList = (currentSelected)=>{
        setSelectTeamRow(currentSelected)
    }
    
    //maybe an utilityfunction woqlClient
    function getActionButtons (cell) {       
        const currentSelected = formatCell(cell,"TEAM" , team)
        if(!accessControlDashboard.isAdmin() || currentSelected.email === localUser.email )return <span className="d-flex"></span>
        return <span className="d-flex">          
            {options.interface.memberList.showDatabase && 
            <Button variant="success" size="sm"   title={`show user dataproducts role`} onClick={() => getUserDatabaseList(currentSelected)}>
                <AiOutlineDatabase/> 
            </Button>}
            {options.interface.memberList.changeRole && 
                <Button variant="success" size="sm"  className="ml-2" title={`change user roles`} onClick={() => changeUserRoleForScope(currentSelected)}>
                    <GrUserAdmin/> 
                </Button>
            }
            {options.interface.memberList.delete &&      
                <Button variant="danger" size="sm" className="ml-5" title={`delete ${currentSelected.email}`} onClick={() => deleteUserItem(currentSelected['userid'])}>              
                    <RiDeleteBin7Line/> 
                </Button>
            }
        </span>
    }

    function getPicture (cell) {
        const picture = cell.row.original["picture"] ? cell.row.original["picture"]['@value'] : undefined
        if (!picture) return ""
        return <img src={picture} 
                    alt={"Profile"}
                    className="nav__main__profile__img mr-4"
                    width="50"/>
    }

    const propsObj = {show, setShow, team:team,loading,
        clickButton:changeUserRole,
        errorMessage,
        successMessage}
    
    
    const tableConfig = getUsersListConfig(10, getActionButtons,getPicture)
    
    if(loading){
        return  <Row className="mr-5 ml-2">
                    <Card className="shadow-sm m-4">
                        <div>LOADING .......</div>
                    </Card>
                </Row>
    }

    return <React.Fragment>
        {currentRoleToUpdate && show && 
            <RoleListModal rolesList={roles} {...currentRoleToUpdate} {...propsObj}   title={`Change the user role for the ${currentRoleToUpdate.name} ${currentRoleToUpdate.type}`}/>
        }
        <Row className="mr-5 ml-2">
            <Card className="shadow-sm m-4">
                <Card.Header className=" d-flex justify-content-between bg-transparent">
                    <h6 className="mb-0 mt-1 float-left w-100 text-muted">Total Members
                        <Badge variant="info" className="text-dark ml-3">{rowCount}</Badge>
                    </h6>

                </Card.Header>
                <Card.Body>
                    <WOQLTable
                        dowloadConfig={{filename:"user_access_level.csv",headers:["email","role"], className:"btn btn-success"}}
                        result={orgUserArr}
                        freewidth={true}
                        view={(tableConfig ? tableConfig.json() : {})}
                        limit={10}
                        start={0}
                        orderBy={""} 
                        loading={loading}
                        totalRows={rowCount}
                    />
                </Card.Body>
                </Card>
                {selectTeamRow && <UserDatabasesList team={team} selectedUser={selectTeamRow} accessControlDashboard={accessControlDashboard}/>}
                   
        </Row>
    </React.Fragment>
}