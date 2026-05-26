import React, { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Typography, Box, Chip, Tooltip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import useStore from '../../store/useStore';

/**
 * OutlookAuth Component
 * Handles Microsoft Outlook authentication for email functionality
 * 
 * Note: This is a UI-only implementation. For production:
 * 1. Register your app in Azure AD Portal (https://portal.azure.com)
 * 2. Get Client ID and configure redirect URIs
 * 3. Implement MSAL authentication flow
 * 4. Add Microsoft Graph API integration
 */
function OutlookAuth() {
  const outlookAuth = useStore((state) => state.outlookAuth);
  const setOutlookAuth = useStore((state) => state.setOutlookAuth);
  const clearOutlookAuth = useStore((state) => state.clearOutlookAuth);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Simulated sign-in function
   * In production, this would:
   * 1. Initialize MSAL PublicClientApplication
   * 2. Call loginPopup() or loginRedirect()
   * 3. Acquire access token for Microsoft Graph
   * 4. Fetch user profile
   */
  const handleSignIn = async () => {
    setIsConnecting(true);
    handleMenuClose();
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated successful authentication
      // In production, replace with actual MSAL authentication
      const mockAuthData = {
        isAuthenticated: true,
        userEmail: 'user@company.com',
        userName: 'Demo User',
        accessToken: 'mock_access_token_' + Date.now(),
      };
      
      setOutlookAuth(mockAuthData);
      setSuccessMessage(`Connected to Outlook as ${mockAuthData.userEmail}`);
    } catch (error) {
      setError('Failed to connect to Outlook. Please try again.');
      console.error('Outlook authentication error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Sign out function
   * In production, this would call MSAL logout()
   */
  const handleSignOut = () => {
    clearOutlookAuth();
    setSuccessMessage('Disconnected from Outlook');
    handleMenuClose();
  };

  if (!outlookAuth.isAuthenticated) {
    return (
      <Tooltip title="Connect your Outlook account for email functionality">
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={handleSignIn}
          disabled={isConnecting}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.5)',
            color: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Outlook'}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={<EmailIcon />}
        label={outlookAuth.userEmail}
        variant="outlined"
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          '& .MuiChip-icon': {
            color: 'white',
          },
        }}
      />
      <Tooltip title="Account options">
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            color: 'white',
          }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 250 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {outlookAuth.userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {outlookAuth.userEmail}
          </Typography>
        </Box>
        <MenuItem onClick={handleSignOut}>
          <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default OutlookAuth;

// Made with Bob