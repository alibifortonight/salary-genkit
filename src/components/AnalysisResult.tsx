import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import { SalaryAnalysis } from '@/app/genkit';

const DemandLevel = ({ level }: { level: string }) => {
  const color = {
    'High': 'success',
    'Medium': 'warning',
    'Low': 'error'
  }[level] || 'default';

  return (
    <Chip
      icon={<TrendingUpIcon />}
      label={`Market Demand: ${level}`}
      color={color as any}
      sx={{ mb: 1 }}
    />
  );
};

export default function AnalysisResult({ result }: { result: SalaryAnalysis }) {
  // Log the result for debugging
  console.log('[AnalysisResult] Rendering with data:', JSON.stringify(result, null, 2));
  
  // Check if we have all required fields
  const hasRequiredFields = 
    result && 
    typeof result.currentSalary === 'number' && 
    typeof result.marketRate === 'number' &&
    typeof result.percentageDifference === 'number';
  
  if (!hasRequiredFields) {
    console.error('[AnalysisResult] Missing required fields in result:', result);
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          The analysis could not be completed properly. Some required data is missing.
        </Alert>
      </Box>
    );
  }
  
  // Calculate percentage difference for display
  const percentDiff = result.percentageDifference;
  const isPositive = percentDiff >= 0;
  
  // Provide fallbacks for optional fields
  const skills = Array.isArray(result.skills) ? result.skills : [];
  const jobTitles = Array.isArray(result.jobTitles) ? result.jobTitles : [];
  const industries = Array.isArray(result.industries) ? result.industries : [];
  const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
  const currency = result.currency || 'SEK';
  const salaryTimeframe = result.salaryTimeframe || 'monthly';
  const experienceLevel = result.experienceLevel || 'Junior';
  const yearsOfExperience = typeof result.yearsOfExperience === 'number' ? result.yearsOfExperience : 0;
  const marketDemand = result.marketDemand || 'Medium';
  const location = result.location || 'Sweden';
  const educationLevel = result.educationLevel || '';
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Current Salary</Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                {result.currentSalary.toLocaleString('sv-SE')} {currency}/{salaryTimeframe}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Market Rate</Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                {result.marketRate.toLocaleString('sv-SE')} {currency}/{salaryTimeframe}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Chip 
              label={`${isPositive ? '+' : ''}${percentDiff.toFixed(1)}% ${isPositive ? 'above' : 'below'} market rate`}
              color={isPositive ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Experience
          </Typography>
          <Typography variant="body1" paragraph>
            {experienceLevel} ({yearsOfExperience} years)
          </Typography>
          <Box sx={{ mb: 2 }}>
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                sx={{ mr: 1, mb: 1 }}
                variant="outlined"
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Market Analysis
          </Typography>
          <Box sx={{ mb: 2 }}>
            <DemandLevel level={marketDemand} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {location}
            </Typography>
            {educationLevel && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {educationLevel}
              </Typography>
            )}
            {industries.length > 0 && (
              <Typography variant="body1">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {industries.join(', ')}
              </Typography>
            )}
          </Box>

          {jobTitles.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Potential Job Titles
              </Typography>
              <Box sx={{ mb: 2 }}>
                {jobTitles.map((title, index) => (
                  <Chip
                    key={index}
                    label={title}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </>
          )}

          {recommendations.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <List dense>
                {recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
