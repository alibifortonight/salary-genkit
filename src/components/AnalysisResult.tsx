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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';

interface SalaryAnalysisResponse {
  estimatedSalary: number;
  experience: {
    level: string;
    years: number;
    keySkills: string[];
  };
  marketDemand: {
    level: string;
    reasons: string[];
  };
  location: string;
  industry: string;
  salaryFactors: string[];
  considerations: string[];
  confidenceScore: number;
}

const DemandLevel = ({ level, reasons }: { level: string; reasons: string[] }) => {
  const color = {
    'High': 'success',
    'Medium': 'warning',
    'Low': 'error'
  }[level] || 'default';

  return (
    <Box>
      <Chip
        icon={<TrendingUpIcon />}
        label={`Market Demand: ${level}`}
        color={color as any}
        sx={{ mb: 1 }}
      />
      <List dense>
        {reasons.map((reason, index) => (
          <ListItem key={index}>
            <ListItemText primary={reason} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default function AnalysisResult({ result }: { result: SalaryAnalysisResponse }) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            {result.estimatedSalary.toLocaleString('sv-SE')} SEK/month
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Experience
          </Typography>
          <Typography variant="body1" paragraph>
            {result.experience.level} ({result.experience.years} years)
          </Typography>
          <Box sx={{ mb: 2 }}>
            {result.experience.keySkills.map((skill, index) => (
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
          <DemandLevel level={result.marketDemand.level} reasons={result.marketDemand.reasons} />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {result.location}
            </Typography>
            <Typography variant="body1">
              <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {result.industry}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Analysis Details
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Key Factors
          </Typography>
          <List dense>
            {result.salaryFactors.map((factor, index) => (
              <ListItem key={index}>
                <ListItemText primary={factor} />
              </ListItem>
            ))}
          </List>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Market Considerations
          </Typography>
          <List dense>
            {result.considerations.map((consideration, index) => (
              <ListItem key={index}>
                <ListItemText primary={consideration} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Confidence Score: {(result.confidenceScore * 100).toFixed(1)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
