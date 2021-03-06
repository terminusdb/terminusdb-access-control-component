import React, {useState, useRef, useEffect} from "react"
import {Form} from "react-bootstrap"
import {BiError} from "react-icons/bi"
import {AccessControlHook} from "../hooks/AccessControlHook"

import { RoleListModal } from "./RoleList"

export const NewMemberModal = ({show, setShow, team, accessControlDashboard,options,defaultEmail}) => {
    if(!accessControlDashboard) return ""
    const {sendInvitation,
          successMessage,
          loading,
          resetInvitation,
          errorMessage} =  AccessControlHook(accessControlDashboard,options)
    const [error, setError]=useState(false)

    const emailInput = useRef(null);
    const roles = accessControlDashboard.getRolesList()

    async function handleInvite(role){
        const email = emailInput.current.value
        //alert(email)
        if(!email || email === "") {
            setError(true)
            return
        }else{
            await sendInvitation(team,email,role)
            emailInput.current.value = ""
            setError(false)
                       
        }
    }

    function handleKeyPress(e) {
        if (e.which === 13 /* Enter */) {
            e.preventDefault()
        }
    }

    const propsObj = {setShow, team:team,
                title:`Invite a new member to your team - ${team}`,
                clickButton:handleInvite}
    const value =  defaultEmail ? {value:defaultEmail} : {}

    return <RoleListModal {...propsObj} 
                loading={loading} 
                errorMessage={errorMessage} 
                successMessage={successMessage} 
                show={show}
                rolesList={roles}>
            {error && <span className="d-flex">
                <BiError className="text-danger mt-1 mr-1"/><p className="text-danger">Email is mandatory</p>
            </span>}
            <Form onKeyPress={handleKeyPress}>
                <Form.Group>
                    <Form.Control
                        ref={emailInput}
                        {...value}
                        type="text"
                        placeholder="Email"
                        aria-describedby="inputGroupPrepend"
                        required
                        onBlur={resetInvitation}
                    />
                </Form.Group>
            </Form>
        </RoleListModal>
}
