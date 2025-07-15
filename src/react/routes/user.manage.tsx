import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/manage')({
  component: UserManage,
})

function UserManage() {
   
    
    return (
        <div>
          manage hello
        </div>
      )
    
}