import { useEffect } from 'react'
import DashboardSection from '../../section/dashboard/Dashboard'

const DashboardPage = () => {
  useEffect(() => {
    document.title = 'Dashboard | Data Center'
  }, [])

  return <DashboardSection />
}

export default DashboardPage