import React, {useEffect,useState} from "react"
import {Row, Badge, Col, Card,Button} from "react-bootstrap"
import {AccessControlHook} from "../hooks/AccessControlHook"
import {WOQLTable} from '@terminusdb/terminusdb-react-table'
import {getListConfigBase} from "../ViewConfig"
import {RiDeleteBin7Line} from "react-icons/ri"
import {FaUsers} from "react-icons/fa"
import { DeleteElementByName } from "./DeleteElementByName"
import { CreateOrganizationModal } from "./CreateOrganizationModal"
import {GET_ALL_ORGANIZATIONS,DELETE_ORGANIZATION} from "../utils/default"
import {MembersListLocal} from "./MembersListLocal"

export const OrganizationList = ({accessControlDashboard,options}) => {  
    if(!accessControlDashboard) return ""

    const [showDelete, setShowDelete] = useState(false)
    const [showAdd, setShowAdd] = useState(false)

    const [viewOrgUsers, setViewOrgUsers] = useState(false)

    const [rowSelected, setRowSelected] = useState(false)
    const {loading,resultTable, getResultTable} =  AccessControlHook(accessControlDashboard,options)    
    
    const tableListArr = Array.isArray(resultTable) ? resultTable.reverse() : []

    // all the system database user
    useEffect(() => {
        updateResultTable()
    }, [])

    function updateResultTable(){
        getResultTable(GET_ALL_ORGANIZATIONS)
    }

    function deleteAction(cell){
        setRowSelected(cell)
        setShowDelete(true)
    }


    function getActionButtons (cell) {
        //const invFullId = cell.row.original['@id']
        const name = cell.row.original['name']
        return <React.Fragment>
                <span className="d-flex">             
                <Button variant="success" size="sm"   title={`show user dataproducts role`} onClick={() => setViewOrgUsers(cell.row.original)}>
                    <FaUsers/> 
                </Button>
                <Button variant="danger" size="sm" className="ml-5" title={`delete - name`} onClick={() => deleteAction(cell.row.original)}>
                  <RiDeleteBin7Line/> 
                </Button>
                </span>
                </React.Fragment>
        
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
        {showDelete && <DeleteElementByName 
                        updateTable={updateResultTable}
                        accessControlDashboard={accessControlDashboard}
                        showModal={showDelete} 
                        setShowModal={setShowDelete} 
                        elementName={rowSelected.name} 
                        elementType="Organization"
                        methodName={DELETE_ORGANIZATION}/>}
                        
        {showAdd && <CreateOrganizationModal
                                options={options} 
                                updateTable={updateResultTable}
                                accessControlDashboard={accessControlDashboard} 
                                showModal={showAdd} 
                                setShowModal={setShowAdd}/>}
       
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
                                       Add Organization
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
                        totalRows={tableListArr.length}
                    />
                </Card.Body>
            </Card>
        </Row>
        {viewOrgUsers && <MembersListLocal organizationInfo={viewOrgUsers} currentUser={"admin"}
                             accessControlDashboard={accessControlDashboard}
                             options={options}/>}
    </React.Fragment>
}