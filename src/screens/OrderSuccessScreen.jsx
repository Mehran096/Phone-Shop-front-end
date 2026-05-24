import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails } from '../slices/orderSlice'

const OrderSuccessScreen = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const query = new URLSearchParams(location.search)
  const sessionId = query.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }
    // Call backend to verify session and update order to paid
    dispatch(getOrderDetails(sessionId))
  }, [sessionId, dispatch, navigate])

  return <h2>Payment successful! Your order is confirmed.</h2>
}