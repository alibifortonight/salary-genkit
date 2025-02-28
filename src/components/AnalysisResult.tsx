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

interface AnalysisResultProps {
  result: {
    estimatedSalary: string;
    details: {
      experience: {
        years: number;
        level: string;
        keySkills: string[];
      };
      analysis: {
        salaryFactors: string[];
        considerations: string[];
        location: string;
        industry: string;
        demand?: {
          level: 'Low' | 'Medium' | 'High';
          reasons: string[];
        };
      };
    };
  };
}

const DemandLevel = ({ demand }: { demand: { level: string, reasons: string[] } }) => {
  const color = {
    'High': 'success',
    'Medium': 'warning',
    'Low': 'error'
  }[demand.level] || 'default';

  return (
    <Box>
      <Chip
        icon={<TrendingUpIcon />}
        label={`Demand: ${demand.level}`}
        color={color as any}
        variant="outlined"
        size="small"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      />
      <List dense sx={{ mt: 1, pl: 2 }}>
        {demand.reasons.map((reason, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemText 
              primary={reason}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default function AnalysisResult({ result }: AnalysisResultProps) {
  console.log('AnalysisResult received:', JSON.stringify(result, null, 2));
  
  if (!result) {
    console.log('Result is null or undefined');
    return null;
  }
  
  return (
    <Card variant="outlined" sx={{ mt: 3, maxWidth: 800, mx: 'auto', width: '100%', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Salary Analysis Results
        </Typography>

        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Estimated Salary Range
          </Typography>
          <Typography variant="h4" color="secondary" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
            {result.estimatedSalary}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={<LocationOnIcon />}
              label={result.details.analysis.location}
              variant="outlined"
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            />
            <Chip
              icon={<BusinessIcon />}
              label={result.details.analysis.industry}
              variant="outlined"
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            />
            {result.details.analysis.demand && (
              <DemandLevel demand={result.details.analysis.demand} />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Experience Profile
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WorkIcon sx={{ mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} color="action" />
            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {result.details.experience.years} years of experience ({result.details.experience.level} level)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {result.details.experience.keySkills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: '24px', sm: '32px' }
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Salary Factors
          </Typography>
          <List dense sx={{ py: 0 }}>
            {result.details.analysis.salaryFactors.map((factor, index) => (
              <ListItem key={index} sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary={factor} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontSize: { xs: '0.875rem', sm: '1rem' } 
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Key Considerations
          </Typography>
          <List dense sx={{ py: 0 }}>
            {result.details.analysis.considerations.map((consideration, index) => (
              <ListItem key={index} sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary={consideration}
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontSize: { xs: '0.875rem', sm: '1rem' } 
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
}
