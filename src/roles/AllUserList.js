import React, {useEffect,useState} from "react"
import {Row, Badge, Col, Card,Button} from "react-bootstrap"
import {AccessControlHook} from "../hooks/AccessControlHook"
import {WOQLTable} from '@terminusdb/terminusdb-react-table'
import {getListConfigBase} from "../ViewConfig"
import {RiDeleteBin7Line} from "react-icons/ri"
import {AiOutlineUserAdd} from "react-icons/ai"
import { GET_ALL_USERS, DELETE_USER } from "../utils/default"
import { DeleteElementModal } from "./DeleteElementModal"
import { CreateUserModal } from "./CreateUserModal"
import {AddUserCapabilityModal} from "./AddUserCapabilityModal"

export const AllUserList = ({accessControlDashboard,options}) => {  
    if(!accessControlDashboard) return ""

    const [showDelete, setShowDelete] = useState(false)
    const [showAdd, setShowAdd ]= useState(false)
    const [showUpdate, setShowUpdate ]= useState(false)

    const [rowSelected, setRowSelected] = useState(false)

    const {loading,resultTable, getResultTable} =  AccessControlHook(accessControlDashboard,options)
    
    const tableListArr = Array.isArray(resultTable) ? resultTable : []

    // all the system database user
    useEffect(() => {
        updateResultTable()
    }, [])

    const updateResultTable = () =>{
        getResultTable(GET_ALL_USERS)
    }


    function deleteAction(cell){
        setRowSelected(cell)
        setShowDelete(true)
    }

    function userToUpdate(cell){
        setRowSelected(cell)
        setShowUpdate(true)
    }


    function getActionButtons (cell) {
        const invFullId = cell.row.original['@id']
        const name = cell.row.original['name']
        return <React.Fragment><span className="d-flex">
            <Button variant="danger" size="sm" className="ml-5" title={`delete - name`} onClick={() => deleteAction(cell.row.original)}>
                <RiDeleteBin7Line/> 
            </Button>
            <Button variant="success" size="sm" className="ml-5" title={`add - name`} onClick={() => userToUpdate(cell.row.original)}>
                <AiOutlineUserAdd/> 
            </Button>
        </span></React.Fragment>
        
    }
    const tableConfig = getListConfigBase(10, getActionButtons)

    if(loading){
        return  <Row className="mr-5 ml-2">
                    <Card className="shadow-sm m-4">
                        <div>LOADING .......</div>
                    </Card>
                </Row>
    }
    

   
    return <React.Fragment>
        {showDelete && <DeleteElementModal 
                        updateTable={updateResultTable}
                        accessControlDashboard={accessControlDashboard}
                        showModal={showDelete} 
                        setShowModal={setShowDelete} 
                        elementName={rowSelected.name} 
                        elementType="User"
                        methodName={DELETE_USER}/>}
                        
        {showAdd && <CreateUserModal
                        options={options} 
                        updateTable={updateResultTable}
                        accessControlDashboard={accessControlDashboard} 
                        showModal={showAdd} 
                        setShowModal={setShowAdd}/>}
        {showUpdate && <AddUserCapabilityModal
                         showModal={showUpdate} 
                         setShowModal={setShowUpdate}
                         accessControlDashboard={accessControlDashboard} 
                         options={options} 
                         defaultName={rowSelected.name}
                         rowSelected ={rowSelected}
                         team = "Organization/fra_org" 
                        />}
        <Row className="mr-5 ml-2">
            <Card className="shadow-sm m-4">
                <Card.Header className="bg-transparent">
                    <Row>
                        <Col>
                            <h6 className="mb-0 mt-1 float-left text-muted">Total Items
                                <Badge variant="info" className="text-dark ml-3">{ tableListArr.length}</Badge>
                            </h6>
                        </Col>
                        <Col >
                            <button onClick={()=>setShowAdd(true)} style={{maxWidth:"200px"}} title="Create New Role"
                                    type="button" className="btn-new-data-product mr-1 pt-2 pb-2 pr-4 pl-4 btn btn-sm btn btn-info">
                                       Add User
                            </button>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <WOQLTable
                        result={tableListArr}
                        freewidth={true}
                        view={(tableConfig ? tableConfig.json() : {})}
                        limit={10}
                        start={0}
                        orderBy={""} 
                        loading={loading}
                        totalRows={ tableListArr.length}
                    />
                </Card.Body>
            </Card>
        </Row>
    </React.Fragment>
}