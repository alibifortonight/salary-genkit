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
  // Calculate percentage difference for display
  const percentDiff = result.percentageDifference;
  const isPositive = percentDiff >= 0;
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Current Salary</Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                {result.currentSalary.toLocaleString('sv-SE')} {result.currency}/{result.salaryTimeframe}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Market Rate</Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                {result.marketRate.toLocaleString('sv-SE')} {result.currency}/{result.salaryTimeframe}
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
            {result.experienceLevel} ({result.yearsOfExperience} years)
          </Typography>
          <Box sx={{ mb: 2 }}>
            {result.skills.map((skill, index) => (
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
            <DemandLevel level={result.marketDemand} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {result.location}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {result.educationLevel}
            </Typography>
            <Typography variant="body1">
              <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {result.industries.join(', ')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Potential Job Titles
          </Typography>
          <Box sx={{ mb: 2 }}>
            {result.jobTitles.map((title, index) => (
              <Chip
                key={index}
                label={title}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List dense>
            {result.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
