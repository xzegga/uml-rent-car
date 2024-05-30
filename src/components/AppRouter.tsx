import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ROLES } from '../models/Users';
import Home from '../pages';
import Users from '../pages/admin/Users';
import Dashboard from '../pages/client/Dashboard';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import Login from '../pages/Login';
import Registre from '../pages/Registre';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AddReservation from '../pages/shared/AddReservation';
import AddVehicle from '../pages/admin/AddVehicle';
import ReservationDetail from '../pages/shared/ReservationDetail';
import Unauthorized from '../pages/Unauthorized';
import Layout from './Layout';
import ProtectedRoute from './ProtectedRoute';
import AddGarage from '../pages/admin/AddGarage';
import Garages from '../pages/admin/Garages';
import Vehicles from '../pages/admin/Vehicles';
import Profile from '../pages/client/Profile';
import ProfileAdm from '../pages/admin/Profile';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route path="" element={<Home />}></Route>
                    <Route path="login" element={<Login />}></Route>
                    <Route path="register" element={<Registre />}></Route>
                    <Route path="unauthorized" element={<Unauthorized />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="/" element={<ProtectedRoute allowedRoles={ROLES.Client} />} >
                        <Route path="client/rentals" element={<Dashboard />} />
                        <Route path="client/rentals/:id" element={<ReservationDetail />} />
                        <Route path="client/rentals/add/:id" element={<AddReservation />} />
                        <Route path="client/profile" element={<Profile />} />
                    </Route>
                    <Route path="/" element={<ProtectedRoute allowedRoles={ROLES.Admin} />} >


                        <Route path="admin/rentals" element={<Dashboard />} />
                        <Route path="admin/rentals/add/:id" element={<AddReservation />} />
                        <Route path="admin/rentals/:id" element={<ReservationDetail />} />

                        <Route path="admin/users" element={<Users />} />
                        <Route path="admin/users/:id" element={<ProfileAdm />} />

                        <Route path="admin/vehicles" element={<Vehicles />} />
                        <Route path="admin/vehicles/add" element={<AddVehicle />} />

                        <Route path="admin/garages" element={<Garages />} />
                        <Route path="admin/garages/add" element={<AddGarage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter >
    );
};

export default AppRouter;
